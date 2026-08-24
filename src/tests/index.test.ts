import { afterEach, describe, expect, it, vi } from "vitest";

describe("index", () => {
    afterEach(() => {
        vi.resetModules();
    });

    it("works", async () => {
        expect.assertions(1);

        const clippy = await vi.importActual<typeof import("../clippy")>("../clippy");

        using runSpy = vi.spyOn(clippy, "run").mockResolvedValue();

        await vi.importActual("../index");

        expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it("catches Error", async () => {
        expect.assertions(1);

        const core = await vi.importActual<typeof import("@actions/core")>("@actions/core");
        const clippy = await vi.importActual<typeof import("../clippy")>("../clippy");

        vi.spyOn(clippy, "run").mockRejectedValue(new Error("It looks like you're running a test"));

        // oxlint-disable-next-line no-empty-function -- mock
        using setFailedSpy = vi.spyOn(core, "setFailed").mockImplementation((_s: Error | string) => {});

        await vi.importActual("../index");

        expect(setFailedSpy).toHaveBeenCalledWith("It looks like you're running a test");
    });

    it("catches not-error", async () => {
        expect.assertions(1);

        const core = await vi.importActual<typeof import("@actions/core")>("@actions/core");
        const clippy = await vi.importActual<typeof import("../clippy")>("../clippy");

        vi.spyOn(clippy, "run").mockRejectedValue(
            "It looks like you're trying to write a test, would you like some assistance? [YES / NO]",
        );

        // oxlint-disable-next-line no-empty-function -- mock
        using setFailedSpy = vi.spyOn(core, "setFailed").mockImplementation((_s: Error | string) => {});

        await vi.importActual("../index");

        expect(setFailedSpy).toHaveBeenCalledWith(
            "It looks like you're trying to write a test, would you like some assistance? [YES / NO]",
        );
    });
});
