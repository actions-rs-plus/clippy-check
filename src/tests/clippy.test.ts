import path from "node:path";

// oxlint-disable-next-line import/no-namespace -- `vi.spyOn` patches a property on the module object
import * as exec from "@actions/exec";
// oxlint-disable-next-line import/no-namespace -- `vi.spyOn` patches a property on the module object
import * as io from "@actions/io";
import { describe, expect, it, vi } from "vitest";

import { run } from "../clippy";
import type { ParsedInput } from "../input";
// oxlint-disable-next-line import/no-namespace -- `vi.spyOn` patches a property on the module object
import * as report from "../reporter";
import type { CompilerMessage } from "../schema";
import { AnnotationLevel } from "../schema";

vi.mock("@actions/core");

vi.setConfig({ testTimeout: 1000 });

/**
 * Builds an `exec` mock that answers the three `-V` probes `buildContext` makes.
 *
 * @param {string} toolchain The toolchain `run` is invoked with, or `undefined` for the default one.
 * @returns {exec.ExecOptions} A mock implementation for `@actions/exec`'s `exec`.
 */
function mockVersionProbes(toolchain?: string): typeof exec.exec {
    const prefix = toolchain === undefined ? [] : [`+${toolchain}`];

    const versions = new Map([
        [["cargo", ...prefix, "-V"].join(" "), "cargo version"],
        [["cargo", ...prefix, "clippy", "-V"].join(" "), "clippy version"],
        [["rustc", ...prefix, "-V"].join(" "), "rustc version"],
    ]);

    return async (commandline: string, arguments_?: string[], options?: exec.ExecOptions): Promise<number> => {
        // `Cargo.get()` resolves `cargo` to a path, `rustc` is invoked by name
        const tool = commandline.endsWith("cargo") ? "cargo" : commandline;
        const version = versions.get([tool, ...(arguments_ ?? [])].join(" "));

        if (version !== undefined) {
            options?.listeners?.stdout?.(Buffer.from(version));
        }

        return 0;
    };
}

describe("clippy", () => {
    it("runs with cargo", async () => {
        expect.assertions(3);

        using execSpy = vi.spyOn(exec, "exec").mockResolvedValue(0);

        using whichSpy = vi.spyOn(io, "which").mockImplementation(async (tool, _check) => {
            return tool;
        });

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: false,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).resolves.toBeUndefined();

        expect(whichSpy).toHaveBeenCalledWith("cargo", true);

        expect(execSpy).toHaveBeenCalledTimes(4);
    });

    it("runs with cross", async () => {
        expect.assertions(3);

        using execSpy = vi.spyOn(exec, "exec").mockResolvedValue(0);

        using whichSpy = vi.spyOn(io, "which").mockImplementation(async (tool, _check) => {
            return tool;
        });

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: true,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).resolves.toBeUndefined();

        expect(execSpy).toHaveBeenCalledTimes(4);

        expect(whichSpy).toHaveBeenCalledWith("cross", true);
    });

    it("reports when clippy fails", async () => {
        expect.assertions(2);

        vi.spyOn(exec, "exec").mockImplementation(async (_commandline: string, arguments_?: string[]) => {
            const expected = ["clippy", "--message-format=json"];

            if (
                (arguments_ ?? []).length > 0 &&
                expected.every((argument) => {
                    return arguments_?.includes(argument) ?? false;
                })
            ) {
                return 101;
            }

            return 0;
        });

        using whichSpy = vi.spyOn(io, "which").mockImplementation(async (tool, _check) => {
            return tool;
        });

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: false,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).rejects.toThrow(/Clippy had exited with the (?<exit_code>\d)+ exit code/v);

        expect(whichSpy).toHaveBeenCalledWith("cargo", true);
    });

    it("reports when clippy fails with a non-default working directory", async () => {
        expect.assertions(3);

        using execSpy = vi
            .spyOn(exec, "exec")
            .mockImplementation(async (_commandline: string, arguments_?: string[]) => {
                const expected = ["clippy", "--message-format=json"];

                if (
                    (arguments_ ?? []).length > 0 &&
                    expected.every((argument) => {
                        return arguments_?.includes(argument) ?? false;
                    })
                ) {
                    return 101;
                }

                return 0;
            });

        using whichSpy = vi.spyOn(io, "which").mockImplementation(async (tool, _check) => {
            return tool;
        });

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: false,
            workingDirectory: "./my/sources/are/here",
        };

        await expect(run(actionInput)).rejects.toThrow(/Clippy had exited with the (?<exit_code>\d)+ exit code/v);

        expect(whichSpy).toHaveBeenCalledWith("cargo", true);

        const expectedCwd = path.join(process.cwd(), "./my/sources/are/here");

        expect(execSpy).toHaveBeenCalledWith(
            "cargo",
            ["+stable", "clippy", "--message-format=json"],
            expect.objectContaining({ cwd: expectedCwd }),
        );
    });

    it("records versions with toolchain", async () => {
        expect.assertions(3);

        vi.spyOn(exec, "exec").mockImplementation(mockVersionProbes("nightly"));

        using reportSpy = vi.spyOn(report, "report");

        using whichSpy = vi.spyOn(io, "which").mockImplementation(async (tool, _check) => {
            return tool;
        });

        const actionInput: ParsedInput = {
            toolchain: "nightly",
            args: [],
            useCross: false,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).resolves.toBeUndefined();

        expect(reportSpy).toHaveBeenCalledWith({ error: 0, help: 0, ice: 0, note: 0, warning: 0 }, [], {
            cargo: "cargo version",
            clippy: "clippy version",
            rustc: "rustc version",
        });

        expect(whichSpy).toHaveBeenCalledWith("cargo", true);
    });

    it("records versions", async () => {
        expect.assertions(3);

        vi.spyOn(exec, "exec").mockImplementation(mockVersionProbes());

        using reportSpy = vi.spyOn(report, "report");

        using whichSpy = vi.spyOn(io, "which").mockImplementation(async (tool, _check) => {
            return tool;
        });

        const actionInput: ParsedInput = {
            toolchain: undefined,
            args: [],
            useCross: false,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).resolves.toBeUndefined();

        expect(whichSpy).toHaveBeenCalledWith("cargo", true);

        expect(reportSpy).toHaveBeenCalledWith({ error: 0, help: 0, ice: 0, note: 0, warning: 0 }, [], {
            cargo: "cargo version",
            clippy: "clippy version",
            rustc: "rustc version",
        });
    });

    it("clippy captures stdout", async () => {
        expect.assertions(3);

        vi.spyOn(exec, "exec").mockImplementation(
            async (_commandline: string, arguments_?: string[], options?: exec.ExecOptions) => {
                const expected = ["clippy", "--message-format=json"];

                if (
                    (arguments_ ?? []).length > 0 &&
                    expected.every((argument) => {
                        return arguments_?.includes(argument) ?? false;
                    })
                ) {
                    const data: CompilerMessage = {
                        reason: "compiler-message",
                        message: {
                            code: "500",
                            level: "warning",
                            message: "message",
                            rendered: "rendered",
                            spans: [
                                {
                                    is_primary: true,
                                    file_name: "main.rs",
                                    line_start: 12,
                                    line_end: 12,
                                    column_start: 30,
                                    column_end: 45,
                                },
                            ],
                        },
                    };
                    options?.listeners?.stdout?.(Buffer.from(`${JSON.stringify(data)}\n`));
                }

                return 0;
            },
        );

        using reportSpy = vi.spyOn(report, "report");

        using whichSpy = vi.spyOn(io, "which").mockImplementation(async (tool, _check) => {
            return tool;
        });

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: false,
            workingDirectory: "./my/sources/are/here",
        };

        await expect(run(actionInput)).resolves.toBeUndefined();

        expect(reportSpy).toHaveBeenCalledWith(
            { error: 0, help: 0, ice: 0, note: 0, warning: 1 },
            [
                {
                    level: AnnotationLevel.Warning,
                    message: "rendered",
                    properties: {
                        endColumn: 45,
                        endLine: 12,
                        file: "my/sources/are/here/main.rs",
                        startColumn: 30,
                        startLine: 12,
                        title: "message",
                    },
                },
            ],
            {
                cargo: "",
                clippy: "",
                rustc: "",
            },
        );

        expect(whichSpy).toHaveBeenCalledWith("cargo", true);
    });
});
