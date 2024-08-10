import * as core from "@actions/core";

import * as input from "./input";

import { run } from "clippy";

async function main(): Promise<void> {
    try {
        const actionInput = input.get();

        await run(actionInput);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            // use the magic of string templates
            core.setFailed(`${String(error)}`);
        }
    }
}

// biome-ignore lint/complexity/noVoid: we use void to signify that we're ignoring the return type of main, which is a promise
void main();
