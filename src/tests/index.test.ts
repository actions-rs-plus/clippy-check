import * as core from "@actions/core";

import * as clippy from "clippy";

jest.mock("clippy");
jest.mock("input");
jest.mock("@actions/core");

describe("index", () => {
    it("works", async () => {
        const runSpy = jest.spyOn(clippy, "run");

        await jest.isolateModulesAsync(async () => {
            await import("index");
        });

        expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it("catches Error", async () => {
        jest.spyOn(clippy, "run").mockRejectedValue(
            new Error("It looks like you're running a test"),
        );

        const setFailedSpy = jest.spyOn(core, "setFailed");

        await jest.isolateModulesAsync(async () => {
            await import("index");
        });

        expect(setFailedSpy).toHaveBeenCalledWith(
            "It looks like you're running a test",
        );
    });

    it("catches not-error", async () => {
        jest.spyOn(clippy, "run").mockRejectedValue(
            "It looks like you're trying to write a test, would you like some assistance? [YES / NO]",
        );

        const setFailedSpy = jest.spyOn(core, "setFailed");

        await jest.isolateModulesAsync(async () => {
            await import("index");
        });

        expect(setFailedSpy).toHaveBeenCalledWith(
            "It looks like you're trying to write a test, would you like some assistance? [YES / NO]",
        );
    });
});
