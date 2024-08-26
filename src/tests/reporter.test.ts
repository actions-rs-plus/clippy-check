import { beforeEach, describe, expect, it, vi } from "vitest";

import { Reporter } from "@/reporter";
import { AnnotationLevel } from "@/schema";

describe("reporter", () => {
    beforeEach(() => {
        vi.mock("@actions/core");
    });

    it("works", async () => {
        const r = new Reporter();

        await expect(
            r.report(
                {
                    error: 0,
                    help: 0,
                    ice: 0,
                    note: 0,
                    warning: 0,
                },
                [
                    {
                        level: AnnotationLevel.Error,
                        message: "I'm an error",
                        properties: {},
                    },
                    {
                        level: AnnotationLevel.Warning,
                        message: "I'm a warning",
                        properties: {},
                    },
                    {
                        level: AnnotationLevel.Notice,
                        message: "I'm a notice",
                        properties: {},
                    },
                ],
                {
                    cargo: "cargo",
                    clippy: "clippy",
                    rustc: "rustc",
                },
            ),
        ).resolves.toBeUndefined();
    });
});
