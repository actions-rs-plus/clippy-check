import { join } from "path";

import { Cargo, Cross } from "@actions-rs-plus/core";
import * as core from "@actions/core";
import * as exec from "@actions/exec";

import type * as input from "./input";
import { OutputParser } from "./outputParser";
import { Reporter } from "./reporter";
import type { AnnotationWithMessageAndLevel, Context, Stats } from "./schema";

type Program = Cargo | Cross;

interface ClippyResult {
    stats: Stats;
    annotations: AnnotationWithMessageAndLevel[];
    exitCode: number;
}

async function buildContext(
    program: Program,
    toolchain: string | undefined,
): Promise<Context> {
    const context: Context = {
        cargo: "",
        clippy: "",
        rustc: "",
    };

    await Promise.all([
        await exec.exec("rustc", buildToolchainArguments(toolchain, ["-V"]), {
            silent: false,
            listeners: {
                stdout: (buffer: Buffer) => {
                    context.rustc = buffer.toString().trim();
                    return context.rustc;
                },
            },
        }),
        await program.call(buildToolchainArguments(toolchain, ["-V"]), {
            silent: false,
            listeners: {
                stdout: (buffer: Buffer) => {
                    context.cargo = buffer.toString().trim();
                    return context.cargo;
                },
            },
        }),
        await program.call(
            buildToolchainArguments(toolchain, ["clippy", "-V"]),
            {
                silent: false,
                listeners: {
                    stdout: (buffer: Buffer) => {
                        context.clippy = buffer.toString().trim();
                        return context.clippy;
                    },
                },
            },
        ),
    ]);

    return context;
}

async function runClippy(
    actionInput: input.ParsedInput,
    program: Program,
): Promise<ClippyResult> {
    const args = buildClippyArguments(actionInput);
    const outputParser = new OutputParser();

    const options: exec.ExecOptions = {
        ignoreReturnCode: true,
        failOnStdErr: false,
        listeners: {
            stdline: (line: string) => {
                outputParser.tryParseClippyLine(line);
            },
        },
    };

    if (actionInput.workingDirectory) {
        options.cwd = join(process.cwd(), actionInput.workingDirectory);
    }

    let exitCode = 0;

    try {
        core.startGroup("Executing cargo clippy (JSON output)");
        exitCode = await program.call(args, options);
    } finally {
        core.endGroup();
    }

    return {
        stats: outputParser.stats,
        annotations: outputParser.annotations,
        exitCode,
    };
}

function getProgram(useCross: boolean): Promise<Program> {
    if (useCross) {
        return Cross.getOrInstall();
    } else {
        return Cargo.get();
    }
}

export async function run(actionInput: input.ParsedInput): Promise<void> {
    const program: Program = await getProgram(actionInput.useCross);

    const context = await buildContext(program, actionInput.toolchain);

    const { stats, annotations, exitCode } = await runClippy(
        actionInput,
        program,
    );

    await new Reporter().report(stats, annotations, context);

    if (exitCode !== 0) {
        throw new Error(`Clippy had exited with the ${exitCode} exit code`);
    }
}

function buildToolchainArguments(
    toolchain: string | undefined,
    after: string[],
): string[] {
    const args = [];

    if (toolchain) {
        args.push(`+${toolchain}`);
    }

    args.push(...after);

    return args;
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
