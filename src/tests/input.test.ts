import { afterAll, beforeEach, describe, expect, test } from "vitest";

import { get } from "@/input";

describe("input", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        process.env = { ...OLD_ENV };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    test("get 1, parses defaults", () => {
        expect(get()).toStrictEqual({ args: [], toolchain: undefined, useCross: false, workingDirectory: undefined });
    });

    test("get 2, can use cross", () => {
        process.env["INPUT_USE-CROSS"] = "true";
        expect(get()).toStrictEqual({ args: [], toolchain: undefined, useCross: true, workingDirectory: undefined });
    });

    test("get 3, parses toolchain", () => {
        process.env["INPUT_TOOLCHAIN"] = "nightly";
        expect(get()).toStrictEqual({ args: [], toolchain: "nightly", useCross: false, workingDirectory: undefined });
    });

    test("get 4, parses +toolchain to toolchain", () => {
        process.env["INPUT_TOOLCHAIN"] = "+nightly";
        expect(get()).toStrictEqual({ args: [], toolchain: "nightly", useCross: false, workingDirectory: undefined });
    });

    test("get 5, parses arguments", () => {
        process.env["INPUT_ARGS"] = "--all-features --all-targets";
        expect(get()).toStrictEqual({
            args: ["--all-features", "--all-targets"],
            toolchain: undefined,
            useCross: false,
            workingDirectory: undefined,
        });
    });
});
