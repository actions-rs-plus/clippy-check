import * as core from "@actions/core";

import { beforeEach, describe, expect, it, vi } from "vitest";

import * as clippy from "@/clippy";

describe("index", () => {
    beforeEach(() => {
        vi.resetModules();

        vi.mock("@/clippy");
        vi.mock("@actions/core");
    });

    it("works", async () => {
        const runSpy = vi.spyOn(clippy, "run");

        await vi.importActual("@/index");

        expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it("catches Error", async () => {
        vi.spyOn(clippy, "run").mockRejectedValue(new Error("It looks like you're running a test"));

        const setFailedSpy = vi.spyOn(core, "setFailed");

        await vi.importActual("@/index");

        expect(setFailedSpy).toHaveBeenCalledWith("It looks like you're running a test");
    });

    it("catches not-error", async () => {
        vi.spyOn(clippy, "run").mockRejectedValue(
            "It looks like you're trying to write a test, would you like some assistance? [YES / NO]",
        );

        const setFailedSpy = vi.spyOn(core, "setFailed");

        await vi.importActual("@/index");

        expect(setFailedSpy).toHaveBeenCalledWith(
            "It looks like you're trying to write a test, would you like some assistance? [YES / NO]",
        );
    });
});
