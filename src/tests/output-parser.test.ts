import os from "node:os";

import core from "@actions/core";
import { describe, expect, it, vi } from "vitest";

import { OutputParser } from "@/output-parser.ts";
import type { CargoMessage, CompilerMessage, Stats } from "@/schema.ts";

describe("outputParser", () => {
    const emptyStats: Stats = {
        error: 0,
        warning: 0,
        note: 0,
        ice: 0,
        help: 0,
    };

    const defaultMessage: CompilerMessage = {
        reason: "compiler-message",
        message: {
            code: "code",
            message: "message",
            rendered: "rendered",
            level: "warning",
            spans: [
                {
                    is_primary: true,
                    column_start: 10,
                    column_end: 15,
                    line_start: 30,
                    line_end: 30,
                    file_name: "main.rs",
                },
            ],
        },
    };

    it("ignores invalid json", () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
        vi.spyOn(core, "debug").mockImplementation(() => {});

        const outputParser = new OutputParser();

        outputParser.tryParseClippyLine("I am not valid json");

        expect(outputParser.stats).toEqual(emptyStats);
    });

    it("ignores non-compiler-messages", () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
        vi.spyOn(core, "debug").mockImplementation(() => {});

        const outputParser = new OutputParser();

        const output: CargoMessage = {
            reason: "not-a-compiler-message",
        };

        outputParser.tryParseClippyLine(JSON.stringify(output));

        expect(outputParser.stats).toEqual(emptyStats);
    });

    it("ignores when compiler-message doesn't have a code", () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
        vi.spyOn(core, "debug").mockImplementation(() => {});

        const outputParser = new OutputParser();

        const output: CargoMessage = {
            reason: "compiler-message",
            message: {
                code: null,
                message: "",
                rendered: "",
                level: "",
                spans: [],
            },
        };

        outputParser.tryParseClippyLine(JSON.stringify(output));

        expect(outputParser.stats).toEqual(emptyStats);
    });

    it.each([
        ["help", undefined],
        ["note", undefined],
        ["warning", undefined],
        ["error", undefined],
        ["error: internal compiler error", "ice"],
    ])("bumps %s when message level is %s", (level, test) => {
        const outputParser = new OutputParser();

        const output: CompilerMessage = {
            reason: defaultMessage.reason,
            message: {
                ...defaultMessage.message,
                level,
            },
        };

        outputParser.tryParseClippyLine(JSON.stringify(output));

        expect(outputParser.stats).toEqual({ ...emptyStats, [test ?? level]: 1 });
    });

    it("ignores when level is not help, note, warning, error, ice", () => {
        const outputParser = new OutputParser();

        const output: CompilerMessage = {
            reason: defaultMessage.reason,
            message: {
                ...defaultMessage.message,
                level: "it's my birthday",
            },
        };

        outputParser.tryParseClippyLine(JSON.stringify(output));

        expect(outputParser.stats).toEqual({ ...emptyStats });
    });

    it("ignores duplicate", () => {
        const outputParser = new OutputParser();

        outputParser.tryParseClippyLine(JSON.stringify(defaultMessage));
        outputParser.tryParseClippyLine(JSON.stringify(defaultMessage));

        expect(outputParser.stats).toEqual({ ...emptyStats, [defaultMessage.message.level]: 1 });
    });

    it("fails when primary span cannot be found", () => {
        const outputParser = new OutputParser();

        const output: CompilerMessage = {
            reason: defaultMessage.reason,
            message: {
                ...defaultMessage.message,
                spans: [],
            },
        };

        expect(() => {
            outputParser.tryParseClippyLine(JSON.stringify(output));
        }).toThrow(/Unable to find primary span for message/);
    });

    it("parses annotations into AnnotationWithMessageAndLevel different `line_start` and `line_end`", () => {
        const outputParser = new OutputParser("./my/sources/are/here");

        outputParser.tryParseClippyLine(
            JSON.stringify({
                reason: defaultMessage.reason,
                message: {
                    ...defaultMessage.message,
                    spans: [
                        {
                            is_primary: true,
                            column_start: 10,
                            column_end: 15,
                            line_start: 25,
                            line_end: 30,
                            file_name: "main.rs",
                        },
                    ],
                },
            }),
        );

        expect(outputParser.annotations).toEqual([
            {
                level: 1,
                message: "rendered",
                properties: {
                    endLine: 30,
                    file: "my/sources/are/here/main.rs",
                    startLine: 25,
                    title: "message",
                },
            },
        ]);
    });

    it("parses annotations into AnnotationWithMessageAndLevel", () => {
        const outputParser = new OutputParser("./my/sources/are/here");

        outputParser.tryParseClippyLine(
            JSON.stringify({
                reason: defaultMessage.reason,
                message: {
                    ...defaultMessage.message,
                    level: "error",
                },
            }),
        );

        expect(outputParser.annotations).toEqual([
            {
                level: 0,
                message: "rendered",
                properties: {
                    endColumn: 15,
                    endLine: 30,
                    file: "my/sources/are/here/main.rs",
                    startColumn: 10,
                    startLine: 30,
                    title: "message",
                },
            },
        ]);
    });

    it("parses multiple annotations into AnnotationWithMessageAndLevel", () => {
        const outputParser = new OutputParser();

        outputParser.tryParseClippyLine(
            JSON.stringify({
                reason: defaultMessage.reason,
                message: {
                    ...defaultMessage.message,
                    level: "error",
                },
            }),
        );

        outputParser.tryParseClippyLine(
            JSON.stringify({
                reason: defaultMessage.reason,
                message: {
                    ...defaultMessage.message,
                    level: "warning",
                },
            }),
        );

        expect(outputParser.annotations).toEqual([
            {
                level: 0,
                message: "rendered",
                properties: {
                    endColumn: 15,
                    endLine: 30,
                    file: "main.rs",
                    startColumn: 10,
                    startLine: 30,
                    title: "message",
                },
            },
            {
                level: 1,
                message: "rendered",
                properties: {
                    endColumn: 15,
                    endLine: 30,
                    file: "main.rs",
                    startColumn: 10,
                    startLine: 30,
                    title: "message",
                },
            },
        ]);
    });

    it("normalizes Windows paths", () => {
        vi.spyOn(os, "platform").mockImplementationOnce(() => "win32");

        const outputParser = new OutputParser();

        outputParser.tryParseClippyLine(
            JSON.stringify({
                reason: defaultMessage.reason,
                message: {
                    ...defaultMessage.message,
                    level: "error",
                    spans: [
                        {
                            ...defaultMessage.message.spans[0],
                            file_name: String.raw`a\windows\path\src\main.rs`,
                        },
                    ],
                },
            }),
        );

        expect(outputParser.annotations[0]?.properties.file).toEqual("a/windows/path/src/main.rs");
    });

    it("don't normalize Windows paths on Linux", () => {
        vi.spyOn(os, "platform").mockImplementationOnce(() => "linux");

        const outputParser = new OutputParser();

        outputParser.tryParseClippyLine(
            JSON.stringify({
                reason: defaultMessage.reason,
                message: {
                    ...defaultMessage.message,
                    level: "error",
                    spans: [
                        {
                            ...defaultMessage.message.spans[0],
                            file_name: String.raw`a\windows\path\src\main.rs`,
                        },
                    ],
                },
            }),
        );

        expect(outputParser.annotations[0]?.properties.file).toEqual(String.raw`a\windows\path\src\main.rs`);
    });
});
