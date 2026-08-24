import { getInput, getInputBool } from "@actions-rs-plus/core";
import stringArgv from "string-argv";

// Parsed action input
export interface ParsedInput {
    args: string[];
    toolchain: string | undefined;
    useCross: boolean;
    workingDirectory: string | undefined;
}

export function get(): ParsedInput {
    let toolchain: string = getInput("toolchain");

    if (toolchain.startsWith("+")) {
        toolchain = toolchain.slice(1);
    }

    const workingDirectory = getInput("working-directory");

    return {
        args: stringArgv(getInput("args")),
        useCross: getInputBool("use-cross"),
        workingDirectory: workingDirectory === "" ? undefined : workingDirectory,
        toolchain: toolchain === "" ? undefined : toolchain,
    };
}
