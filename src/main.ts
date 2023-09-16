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

void main();
