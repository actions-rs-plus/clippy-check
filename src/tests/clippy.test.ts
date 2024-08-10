import * as exec from "@actions/exec";

import { run } from "clippy";
import type { ParsedInput } from "input";
import { Reporter } from "reporter";
import type { CargoMessage } from "schema";

jest.mock("@actions/core");
jest.mock("@actions/exec");
jest.mock("reporter");

describe("clippy", () => {
    it("runs with cargo", async () => {
        jest.spyOn(exec, "exec").mockResolvedValue(0);

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: false,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).resolves.toBeUndefined();
    });

    it("runs with cross", async () => {
        jest.spyOn(exec, "exec").mockResolvedValue(0);

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: true,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).resolves.toBeUndefined();
    });

    it("reports when clippy fails", async () => {
        jest.spyOn(exec, "exec").mockImplementation(
            (_commandline: string, args?: string[] | undefined) => {
                const expected = ["clippy", "--message-format=json"];

                if (
                    (args ?? []).length > 0 &&
                    expected.every((c) => {
                        return args?.includes(c);
                    })
                ) {
                    return Promise.resolve(101);
                } else {
                    return Promise.resolve(0);
                }
            },
        );

        const actionInput: ParsedInput = {
            toolchain: "stable",
            args: [],
            useCross: false,
            workingDirectory: undefined,
        };

        await expect(run(actionInput)).rejects.toThrow(
            /Clippy had exited with the (\d)+ exit code/,
        );
    });

    it("records versions with toolchain", async () => {
        const reportSpy = jest.spyOn(Reporter.prototype, "report");
        jest.spyOn(exec, "exec").mockImplementation(
            (
                commandline: string,
                args?: string[],
                options?: exec.ExecOptions,
            ) => {
                if (commandline.endsWith("cargo")) {
                    if (args?.[0] === "+nightly" && args?.[1] === "-V") {
                        options?.listeners?.stdout?.(
                            Buffer.from("cargo version"),
                        );
                    } else if (
                        args?.[0] === "+nightly" &&
                        args?.[1] === "clippy" &&
                        args?.[2] === "-V"
                    ) {
                        options?.listeners?.stdout?.(
                            Buffer.from("clippy version"),
                        );
                    }
                } else if (
                    commandline === "rustc" &&
                    args?.[0] === "+nightly" &&
                    args?.[1] === "-V"
                ) {
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

        expect(reportSpy).toBeCalledWith(
            { error: 0, help: 0, ice: 0, note: 0, warning: 0 },
            [],
            {
                cargo: "cargo version",
                clippy: "clippy version",
                rustc: "rustc version",
            },
        );
    });

    it("records versions", async () => {
        const reportSpy = jest.spyOn(Reporter.prototype, "report");
        jest.spyOn(exec, "exec").mockImplementation(
            (
                commandline: string,
                args?: string[],
                options?: exec.ExecOptions,
            ) => {
                if (commandline.endsWith("cargo")) {
                    if (args?.[0] === "-V") {
                        options?.listeners?.stdout?.(
                            Buffer.from("cargo version"),
                        );
                    } else if (args?.[0] === "clippy" && args?.[1] === "-V") {
                        options?.listeners?.stdout?.(
                            Buffer.from("clippy version"),
                        );
                    }
                } else if (commandline === "rustc" && args?.[0] === "-V") {
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

        expect(reportSpy).toBeCalledWith(
            { error: 0, help: 0, ice: 0, note: 0, warning: 0 },
            [],
            {
                cargo: "cargo version",
                clippy: "clippy version",
                rustc: "rustc version",
            },
        );
    });

    it("clippy captures stdout", async () => {
        jest.spyOn(exec, "exec").mockImplementation(
            (
                _commandline: string,
                args?: string[] | undefined,
                options?: exec.ExecOptions,
            ) => {
                const expected = ["clippy", "--message-format=json"];

                if (
                    (args ?? []).length > 0 &&
                    expected.every((c) => {
                        return args?.includes(c);
                    })
                ) {
                    const data: CargoMessage = {
                        reason: "compiler-message",
                        message: {
                            code: "500",
                            level: "warning",
                            message: "message",
                            rendered: "rendered",
                            spans: [
                                {
                                    // biome-ignore lint/style/useNamingConvention: contract
                                    is_primary: true,
                                    // biome-ignore lint/style/useNamingConvention: contract
                                    file_name: "main.rs",
                                    // biome-ignore lint/style/useNamingConvention: contract
                                    line_start: 12,
                                    // biome-ignore lint/style/useNamingConvention: contract
                                    line_end: 12,
                                    // biome-ignore lint/style/useNamingConvention: contract
                                    column_start: 30,
                                    // biome-ignore lint/style/useNamingConvention: contract
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
