import { afterEach, describe, expect, it, vi } from "vitest";

describe("index", () => {
    afterEach(() => {
        vi.resetModules();
    });

    it("works", async () => {
        const clippy = await vi.importActual<typeof import("@/clippy.ts")>("@/clippy.ts");

        using runSpy = vi.spyOn(clippy, "run").mockResolvedValue();

        await vi.importActual("@/index");

        expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it("catches Error", async () => {
        const core = await vi.importActual<typeof import("@actions/core")>("@actions/core");
        const clippy = await vi.importActual<typeof import("@/clippy.ts")>("@/clippy.ts");

        vi.spyOn(clippy, "run").mockRejectedValue(new Error("It looks like you're running a test"));

        // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
        using setFailedSpy = vi.spyOn(core, "setFailed").mockImplementation((_s: Error | string) => {});

        await vi.importActual("@/index");

        expect(setFailedSpy).toHaveBeenCalledWith("It looks like you're running a test");
    });

    it("catches not-error", async () => {
        const core = await vi.importActual<typeof import("@actions/core")>("@actions/core");
        const clippy = await vi.importActual<typeof import("@/clippy.ts")>("@/clippy.ts");

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
