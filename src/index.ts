import "source-map-support/register";

import * as core from "@actions/core";

import { run } from "@/clippy.ts";
import * as input from "@/input.ts";

async function main(): Promise<void> {
    try {
        const actionInput = input.get();

        await run(actionInput);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            // use the magic of string templates
            core.setFailed(String(error));
        }
    }
}

await main();
