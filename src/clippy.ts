import path from "node:path";

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { Cargo, Cross } from "@actions-rs-plus/core";

import type { BaseProgram } from "@actions-rs-plus/core";

import type * as input from "@/input.ts";
import { OutputParser } from "@/output-parser.ts";
import { report } from "@/reporter.ts";
import type { AnnotationWithMessageAndLevel, Context, Stats } from "@/schema.ts";

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

/// Copied from https://github.com/actions/toolkit/blob/683703c1149439530dcee7b8c5dbbfeec4104368/packages/exec/src/toolrunner.ts#L83
/// & Replaced `os.EOL` by the POSIX EOL
function _processLineBuffer(data: Buffer, stringBuffer: string, onLine: (line: string) => void): string {
    const POSIX_EOL = "\n";

    let s = stringBuffer + data.toString();
    let n = s.indexOf(POSIX_EOL);

    while (n > -1) {
        const line = s.slice(0, Math.max(0, n));
        onLine(line);

        // the rest of the string ...
        s = s.slice(Math.max(0, n + POSIX_EOL.length));
        n = s.indexOf(POSIX_EOL);
    }

    return s;
}

async function runClippy(actionInput: input.ParsedInput, program: BaseProgram): Promise<ClippyResult> {
    const arguments_ = buildClippyArguments(actionInput);
    const outputParser = new OutputParser();

    let stdbuffer = "";
    const options: exec.ExecOptions = {
        failOnStdErr: false,
        ignoreReturnCode: true,
        listeners: {
            stdout: (data: Buffer) => {
                stdbuffer = _processLineBuffer(data, stdbuffer, (line: string) => {
                    outputParser.tryParseClippyLine(line);
                });
            },
        },
    };

    if (actionInput.workingDirectory !== undefined && actionInput.workingDirectory !== "") {
        options.cwd = path.join(process.cwd(), actionInput.workingDirectory);
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

    await report(stats, annotations, context);

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
