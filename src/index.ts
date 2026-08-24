#!/usr/bin/env node

// oxlint-disable-next-line import/no-unassigned-import -- installs the source-map hook as a side effect
import "source-map-support/register";
import { setFailed } from "@actions/core";

import { run } from "./clippy";
import { get } from "./input";

async function main(): Promise<void> {
    try {
        const actionInput = get();

        await run(actionInput);
    } catch (error) {
        if (Error.isError(error)) {
            setFailed(error.message);
        } else {
            // use the magic of string templates
            setFailed(String(error));
        }
    }
}

await main();
