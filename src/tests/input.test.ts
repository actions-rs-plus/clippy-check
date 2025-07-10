import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { get } from "@/input.ts";

describe("input", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        process.env = { ...OLD_ENV };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it("parses defaults", () => {
        expect(get()).toStrictEqual({ args: [], toolchain: undefined, useCross: false, workingDirectory: undefined });
    });

    it("can use cross", () => {
        process.env["INPUT_USE-CROSS"] = "true";
        expect(get()).toStrictEqual({ args: [], toolchain: undefined, useCross: true, workingDirectory: undefined });
    });

    it("parses working-directory", () => {
        process.env["INPUT_WORKING-DIRECTORY"] = "/tmp/sources";
        expect(get()).toStrictEqual({
            args: [],
            toolchain: undefined,
            useCross: false,
            workingDirectory: "/tmp/sources",
        });
    });

    it("parses toolchain", () => {
        process.env["INPUT_TOOLCHAIN"] = "nightly";
        expect(get()).toStrictEqual({ args: [], toolchain: "nightly", useCross: false, workingDirectory: undefined });
    });

    it("parses +toolchain to toolchain", () => {
        process.env["INPUT_TOOLCHAIN"] = "+nightly";
        expect(get()).toStrictEqual({ args: [], toolchain: "nightly", useCross: false, workingDirectory: undefined });
    });

    it("parses arguments", () => {
        process.env["INPUT_ARGS"] = "--all-features --all-targets";
        expect(get()).toStrictEqual({
            args: ["--all-features", "--all-targets"],
            toolchain: undefined,
            useCross: false,
            workingDirectory: undefined,
        });
    });
});
