import { describe, expect, it, vi } from "vitest";

import { report } from "@/reporter.ts";
import { AnnotationLevel } from "@/schema.ts";

vi.mock("@actions/core");

describe("reporter", () => {
    it("works", async () => {
        await expect(
            report(
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
