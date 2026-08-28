import path from "node:path";

import type { BaseProgram } from "@actions-rs-plus/core";
import { Cargo, Cross } from "@actions-rs-plus/core";
import { endGroup, startGroup } from "@actions/core";
import type { ExecOptions } from "@actions/exec";
import { exec } from "@actions/exec";

import type { ParsedInput } from "./input";
import { OutputParser } from "./output-parser";
import { report } from "./reporter";
import type { AnnotationWithMessageAndLevel, Context, Stats } from "./schema";

interface ClippyResult {
    annotations: AnnotationWithMessageAndLevel[];
    exitCode: number;
    stats: Stats;
}

async function buildContext(program: BaseProgram, toolchain: string | undefined): Promise<Context> {
    const context: Context = {
        cargo: "",
        clippy: "",
        rustc: "",
    };

    await Promise.all([
        exec("rustc", buildToolchainArguments(toolchain, ["-V"]), {
            listeners: {
                stdout: (buffer: Buffer) => {
                    context.rustc = buffer.toString().trim();
                },
            },
            silent: false,
        }),
        program.call(buildToolchainArguments(toolchain, ["-V"]), {
            listeners: {
                stdout: (buffer: Buffer) => {
                    context.cargo = buffer.toString().trim();
                },
            },
            silent: false,
        }),
        program.call(buildToolchainArguments(toolchain, ["clippy", "-V"]), {
            listeners: {
                stdout: (buffer: Buffer) => {
                    context.clippy = buffer.toString().trim();
                },
            },
            silent: false,
        }),
    ]);

    return context;
}

/// Copied from https://github.com/actions/toolkit/blob/683703c1149439530dcee7b8c5dbbfeec4104368/packages/exec/src/toolrunner.ts#L83
/// & Replaced `os.EOL` by the POSIX EOL
function processLineBuffer(data: Buffer, stringBuffer: string, onLine: (line: string) => void): string {
    const POSIX_EOL = "\n";

    let rest = stringBuffer + data.toString();
    let eolIndex = rest.indexOf(POSIX_EOL);

    while (eolIndex > -1) {
        const line = rest.slice(0, Math.max(0, eolIndex));
        onLine(line);

        // the rest of the string ...
        rest = rest.slice(Math.max(0, eolIndex + POSIX_EOL.length));
        eolIndex = rest.indexOf(POSIX_EOL);
    }

    return rest;
}

async function runClippy(actionInput: ParsedInput, program: BaseProgram): Promise<ClippyResult> {
    const args = buildClippyArguments(actionInput);
    const outputParser = new OutputParser(actionInput.workingDirectory);

    let stdbuffer = "";
    const options: ExecOptions = {
        failOnStdErr: false,
        ignoreReturnCode: true,
        listeners: {
            stdout: (data: Buffer) => {
                stdbuffer = processLineBuffer(data, stdbuffer, (line: string) => {
                    outputParser.tryParseClippyLine(line);
                });
            },
        },
    };

    if (actionInput.workingDirectory !== undefined && actionInput.workingDirectory !== "") {
        options.cwd = path.join(process.cwd(), actionInput.workingDirectory);
    }

    // oxlint-disable-next-line typescript/init-declarations -- initialized below, no other way to do this except for an IIFE
    let exitCode: number;

    try {
        startGroup("Executing cargo clippy (JSON output)");
        exitCode = await program.call(args, options);
    } finally {
        endGroup();
    }

    return {
        stats: outputParser.stats,
        annotations: outputParser.annotations,
        exitCode,
    };
}

async function getProgram(useCross: boolean): Promise<BaseProgram> {
    if (useCross) {
        return Cross.getOrInstall();
    }

    return Cargo.get();
}

function buildToolchainArguments(toolchain: string | undefined, after: string[]): string[] {
    const args = [];

    if (toolchain !== undefined && toolchain !== "") {
        args.push(`+${toolchain}`);
    }

    args.push(...after);

    return args;
}

function buildClippyArguments(actionInput: ParsedInput): string[] {
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

export async function run(actionInput: ParsedInput): Promise<void> {
    const program: BaseProgram = await getProgram(actionInput.useCross);

    const context = await buildContext(program, actionInput.toolchain);

    const { stats, annotations, exitCode } = await runClippy(actionInput, program);

    await report(stats, annotations, context);

    if (exitCode !== 0) {
        throw new Error(`Clippy had exited with the ${exitCode} exit code`);
    }
}
