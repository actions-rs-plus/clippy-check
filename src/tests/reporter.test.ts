import { summary } from "@actions/core";
import { describe, expect, it, vi } from "vitest";

import { report } from "../reporter";
import { AnnotationLevel } from "../schema";

vi.mock("@actions/core");

vi.setConfig({ testTimeout: 1000 });

describe("reporter", () => {
    it("works", async () => {
        expect.assertions(1);

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

    it("lists every annotation in the summary", async () => {
        expect.assertions(1);

        using addTableSpy = vi.spyOn(summary, "addTable");

        await report(
            {
                error: 1,
                help: 0,
                ice: 0,
                note: 0,
                warning: 1,
            },
            [
                {
                    level: AnnotationLevel.Error,
                    message: "rendered error",
                    properties: {
                        file: "src/main.rs",
                        startLine: 42,
                        endLine: 42,
                        title: "unused variable: `items: Vec<String>`",
                    },
                },
                {
                    level: AnnotationLevel.Warning,
                    message: "rendered warning",
                    properties: {
                        title: "lint `clippy::foo` has been removed",
                    },
                },
            ],
            {
                cargo: "cargo",
                clippy: "clippy",
                rustc: "rustc",
            },
        );

        expect(addTableSpy).toHaveBeenLastCalledWith([
            [
                {
                    header: true,
                    data: "Level",
                },
                {
                    header: true,
                    data: "Location",
                },
                {
                    header: true,
                    data: "Message",
                },
            ],
            ["Error", "src/main.rs:42", "unused variable: `items: Vec&lt;String&gt;`"],
            ["Warning", "", "lint `clippy::foo` has been removed"],
        ]);
    });

    it("omits the diagnostics table without annotations", async () => {
        expect.assertions(1);

        using addTableSpy = vi.spyOn(summary, "addTable");

        await report(
            {
                error: 0,
                help: 0,
                ice: 0,
                note: 0,
                warning: 0,
            },
            [],
            {
                cargo: "cargo",
                clippy: "clippy",
                rustc: "rustc",
            },
        );

        expect(addTableSpy).toHaveBeenCalledTimes(1);
    });
});
