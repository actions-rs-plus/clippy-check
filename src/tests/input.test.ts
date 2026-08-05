import { describe, expect, it, vi } from "vitest";

import { get } from "../input";

describe("input", () => {
    it("parses defaults", () => {
        expect(get()).toStrictEqual({ args: [], toolchain: undefined, useCross: false, workingDirectory: undefined });
    });

    it("can use cross", () => {
        vi.stubEnv("INPUT_USE-CROSS", "true");

        expect(get()).toStrictEqual({ args: [], toolchain: undefined, useCross: true, workingDirectory: undefined });
    });

    it("parses working-directory", () => {
        vi.stubEnv("INPUT_WORKING-DIRECTORY", "/tmp/sources");

        expect(get()).toStrictEqual({
            args: [],
            toolchain: undefined,
            useCross: false,
            workingDirectory: "/tmp/sources",
        });
    });

    it("parses toolchain", () => {
        vi.stubEnv("INPUT_TOOLCHAIN", "nightly");

        expect(get()).toStrictEqual({ args: [], toolchain: "nightly", useCross: false, workingDirectory: undefined });
    });

    it("parses +toolchain to toolchain", () => {
        vi.stubEnv("INPUT_TOOLCHAIN", "+nightly");

        expect(get()).toStrictEqual({ args: [], toolchain: "nightly", useCross: false, workingDirectory: undefined });
    });

    it("parses arguments", () => {
        vi.stubEnv("INPUT_ARGS", "--all-features --all-targets");

        expect(get()).toStrictEqual({
            args: ["--all-features", "--all-targets"],
            toolchain: undefined,
            useCross: false,
            workingDirectory: undefined,
        });
    });
});
