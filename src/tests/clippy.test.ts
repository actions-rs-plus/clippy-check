import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { run } from "@/clippy";
import type { ParsedInput } from "@/input";
import * as report from "@/reporter";
import type { CompilerMessage } from "@/schema";

vi.mock("@actions/core");

describe("clippy", () => {
    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
        vi.spyOn(core, "startGroup").mockImplementation(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
        vi.spyOn(core, "endGroup").mockImplementation(() => {});
    });

    it("runs with cargo", async () => {
        const execSpy = vi.spyOn(exec, "exec").mockResolvedValue(0);

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: false,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).resolves.toBeUndefined();
        expect(execSpy).toBeCalledTimes(4);
    });

    it("runs with cross", async () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
        const debugSpy = vi.spyOn(core, "debug").mockImplementation((_s: string) => {});
        const execSpy = vi.spyOn(exec, "exec").mockResolvedValue(0);

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: true,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).resolves.toBeUndefined();
        expect(execSpy).toBeCalledTimes(5);
        expect(debugSpy).toBeCalledTimes(1);
    });

    it("reports when clippy fails", async () => {
        vi.spyOn(exec, "exec").mockImplementation((_commandline: string, arguments_?: string[]) => {
            const expected = ["clippy", "--message-format=json"];

            if (
                (arguments_ ?? []).length > 0 &&
                expected.every((c) => {
                    return arguments_?.includes(c) ?? false;
                })
            ) {
                return Promise.resolve(101);
            } else {
                return Promise.resolve(0);
            }
        });

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: false,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).rejects.toThrow(/Clippy had exited with the (\d)+ exit code/);
    });

    it("records versions with toolchain", async () => {
        const reportSpy = vi.spyOn(report, "report");
        vi.spyOn(exec, "exec").mockImplementation(
            (commandline: string, arguments_?: string[], options?: exec.ExecOptions) => {
                if (commandline.endsWith("cargo")) {
                    if (arguments_?.[0] === "+nightly" && arguments_[1] === "-V") {
                        options?.listeners?.stdout?.(Buffer.from("cargo version"));
                    } else if (arguments_?.[0] === "+nightly" && arguments_[1] === "clippy" && arguments_[2] === "-V") {
                        options?.listeners?.stdout?.(Buffer.from("clippy version"));
                    }
                } else if (commandline === "rustc" && arguments_?.[0] === "+nightly" && arguments_[1] === "-V") {
                    options?.listeners?.stdout?.(Buffer.from("rustc version"));
                }
                return Promise.resolve(0);
            },
        );

        const actionInput: ParsedInput = {
            toolchain: "nightly",
            args: [],
            useCross: false,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).resolves.toBeUndefined();

        expect(reportSpy).toBeCalledWith({ error: 0, help: 0, ice: 0, note: 0, warning: 0 }, [], {
            cargo: "cargo version",
            clippy: "clippy version",
            rustc: "rustc version",
        });
    });

    it("records versions", async () => {
        const reportSpy = vi.spyOn(report, "report");
        vi.spyOn(exec, "exec").mockImplementation(
            (commandline: string, arguments_?: string[], options?: exec.ExecOptions) => {
                if (commandline.endsWith("cargo")) {
                    if (arguments_?.[0] === "-V") {
                        options?.listeners?.stdout?.(Buffer.from("cargo version"));
                    } else if (arguments_?.[0] === "clippy" && arguments_[1] === "-V") {
                        options?.listeners?.stdout?.(Buffer.from("clippy version"));
                    }
                } else if (commandline === "rustc" && arguments_?.[0] === "-V") {
                    options?.listeners?.stdout?.(Buffer.from("rustc version"));
                }
                return Promise.resolve(0);
            },
        );

        const actionInput: ParsedInput = {
            toolchain: undefined,
            args: [],
            useCross: false,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).resolves.toBeUndefined();

        expect(reportSpy).toBeCalledWith({ error: 0, help: 0, ice: 0, note: 0, warning: 0 }, [], {
            cargo: "cargo version",
            clippy: "clippy version",
            rustc: "rustc version",
        });
    });

    it("clippy captures stdout", async () => {
        vi.spyOn(exec, "exec").mockImplementation(
            (_commandline: string, arguments_?: string[], options?: exec.ExecOptions) => {
                const expected = ["clippy", "--message-format=json"];

                if (
                    (arguments_ ?? []).length > 0 &&
                    expected.every((c) => {
                        return arguments_?.includes(c) ?? false;
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
                    options?.listeners?.stdline?.(JSON.stringify(data));
                }

                return Promise.resolve(0);
            },
        );

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: false,
            workingDirectory: "./my/sources/are/here",
        };

        await expect(run(actionInput)).resolves.toBeUndefined();
    });
});
