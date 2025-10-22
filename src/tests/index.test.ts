import * as core from "@actions/core";

import { afterEach, describe, expect, it, vi } from "vitest";

import * as clippy from "@/clippy.ts";

vi.mock("@/clippy");

describe("index", () => {
    afterEach(() => {
        vi.resetModules();
    });

    it("works", async () => {
        using runSpy = vi.spyOn(clippy, "run");

        await vi.importActual("@/index");

        expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it("catches Error", async () => {
        vi.spyOn(clippy, "run").mockRejectedValue(new Error("It looks like you're running a test"));

        // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
        using setFailedSpy = vi.spyOn(core, "setFailed").mockImplementation((_s: Error | string) => {});

        await vi.importActual("@/index");

        expect(setFailedSpy).toHaveBeenCalledWith("It looks like you're running a test");
    });

    it("catches not-error", async () => {
        vi.spyOn(clippy, "run").mockRejectedValue(
            "It looks like you're trying to write a test, would you like some assistance? [YES / NO]",
        );

        // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
        using setFailedSpy = vi.spyOn(core, "setFailed").mockImplementation((_s: Error | string) => {});

        await vi.importActual("@/index");

        expect(setFailedSpy).toHaveBeenCalledWith(
            "It looks like you're trying to write a test, would you like some assistance? [YES / NO]",
        );
    });
});
