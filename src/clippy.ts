import nodePath from "node:path";

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { Cargo, Cross } from "@actions-rs-plus/core";

import type { BaseProgram } from "@actions-rs-plus/core/dist/commands/base-program";

import type * as input from "@/input";
import { OutputParser } from "@/output-parser";
import { Reporter } from "@/reporter";
import type { AnnotationWithMessageAndLevel, Context, Stats } from "@/schema";

interface ClippyResult {
    stats: Stats;
    annotations: AnnotationWithMessageAndLevel[];
    exitCode: number;
}

async function buildContext(program: BaseProgram, toolchain: string | undefined): Promise<Context> {
    const context: Context = {
        cargo: "",
        clippy: "",
        rustc: "",
    };

    await Promise.all([
        exec.exec("rustc", buildToolchainArguments(toolchain, ["-V"]), {
            listeners: {
                stdout: (buffer: Buffer) => {
                    return (context.rustc = buffer.toString().trim());
                },
            },
            silent: false,
        }),
        program.call(buildToolchainArguments(toolchain, ["-V"]), {
            listeners: {
                stdout: (buffer: Buffer) => {
                    return (context.cargo = buffer.toString().trim());
                },
            },
            silent: false,
        }),
        program.call(buildToolchainArguments(toolchain, ["clippy", "-V"]), {
            listeners: {
                stdout: (buffer: Buffer) => {
                    return (context.clippy = buffer.toString().trim());
                },
            },
            silent: false,
        }),
    ]);

    return context;
}

async function runClippy(actionInput: input.ParsedInput, program: BaseProgram): Promise<ClippyResult> {
    const arguments_ = buildClippyArguments(actionInput);
    const outputParser = new OutputParser();

    const options: exec.ExecOptions = {
        failOnStdErr: false,
        ignoreReturnCode: true,
        listeners: {
            stdline: (line: string) => {
                outputParser.tryParseClippyLine(line);
            },
        },
    };

    if (actionInput.workingDirectory !== undefined && actionInput.workingDirectory !== "") {
        options.cwd = nodePath.join(process.cwd(), actionInput.workingDirectory);
    }

    let exitCode = 0;

    try {
        core.startGroup("Executing cargo clippy (JSON output)");
        exitCode = await program.call(arguments_, options);
    } finally {
        core.endGroup();
    }

    return {
        stats: outputParser.stats,
        annotations: outputParser.annotations,
        exitCode,
    };
}

function getProgram(useCross: boolean): Promise<BaseProgram> {
    if (useCross) {
        return Cross.getOrInstall();
    } else {
        return Cargo.get();
    }
}

export async function run(actionInput: input.ParsedInput): Promise<void> {
    const program: BaseProgram = await getProgram(actionInput.useCross);

    const context = await buildContext(program, actionInput.toolchain);

    const { stats, annotations, exitCode } = await runClippy(actionInput, program);

    await new Reporter().report(stats, annotations, context);

    if (exitCode !== 0) {
        throw new Error(`Clippy had exited with the ${exitCode} exit code`);
    }
}

function buildToolchainArguments(toolchain: string | undefined, after: string[]): string[] {
    const arguments_ = [];

    if (toolchain !== undefined && toolchain !== "") {
        arguments_.push(`+${toolchain}`);
    }

    arguments_.push(...after);

    return arguments_;
}

function buildClippyArguments(actionInput: input.ParsedInput): string[] {
    // Toolchain selection MUST go first in any condition!
    return buildToolchainArguments(actionInput.toolchain, [
        "clippy",

        // `--message-format=json` should just right after the `cargo clippy`
        // because usually people are adding the `-- -D warnings` at the end
        // of arguments and it will mess up the output.
        "--message-format=json",

        // and the rest
        ...actionInput.args,
    ]);
}
