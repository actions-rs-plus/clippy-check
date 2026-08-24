import os from "node:os";

// oxlint-disable-next-line import/no-namespace -- `vi.spyOn` patches a property on the module object
import * as core from "@actions/core";
import { describe, expect, it, vi } from "vitest";

import { OutputParser } from "../output-parser";
import type { CargoMessage, CompilerMessage, Stats } from "../schema";
import { AnnotationLevel } from "../schema";

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
        // oxlint-disable-next-line no-empty-function -- mock
        vi.spyOn(core, "debug").mockImplementation(() => {});

        const outputParser = new OutputParser();

        outputParser.tryParseClippyLine("I am not valid json");

        expect(outputParser.stats).toEqual(emptyStats);
    });

    it("ignores non-compiler-messages", () => {
        // oxlint-disable-next-line no-empty-function -- mock
        vi.spyOn(core, "debug").mockImplementation(() => {});

        const outputParser = new OutputParser();

        const output: CargoMessage = {
            reason: "not-a-compiler-message",
        };

        outputParser.tryParseClippyLine(JSON.stringify(output));

        expect(outputParser.stats).toEqual(emptyStats);
    });

    it("ignores when compiler-message doesn't have a code", () => {
        // oxlint-disable-next-line no-empty-function -- mock
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

    it("creates an annotation without file location when primary span cannot be found", () => {
        const outputParser = new OutputParser();

        const output: CompilerMessage = {
            reason: defaultMessage.reason,
            message: {
                ...defaultMessage.message,
                spans: [],
            },
        };

        outputParser.tryParseClippyLine(JSON.stringify(output));

        expect(outputParser.stats).toEqual({ ...emptyStats, warning: 1 });
        expect(outputParser.annotations).toEqual([
            {
                level: AnnotationLevel.Warning,
                message: "rendered",
                properties: {
                    title: "message",
                },
            },
        ]);
    });

    it("parses annotations into AnnotationWithMessageAndLevel with different `line_start` and `line_end`", () => {
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
                level: AnnotationLevel.Warning,
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
                level: AnnotationLevel.Error,
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

    it("emits one annotation per primary span, counting the diagnostic once", () => {
        const outputParser = new OutputParser();

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
                            line_start: 30,
                            line_end: 30,
                            file_name: "main.rs",
                        },
                        {
                            is_primary: false,
                            column_start: 1,
                            column_end: 5,
                            line_start: 28,
                            line_end: 28,
                            file_name: "main.rs",
                        },
                        {
                            is_primary: true,
                            column_start: 3,
                            column_end: 7,
                            line_start: 12,
                            line_end: 12,
                            file_name: "lib.rs",
                        },
                    ],
                },
            }),
        );

        expect(outputParser.stats).toEqual({ ...emptyStats, warning: 1 });
        expect(outputParser.annotations).toEqual([
            {
                level: AnnotationLevel.Warning,
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
                level: AnnotationLevel.Warning,
                message: "rendered",
                properties: {
                    endColumn: 7,
                    endLine: 12,
                    file: "lib.rs",
                    startColumn: 3,
                    startLine: 12,
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
                level: AnnotationLevel.Error,
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
                level: AnnotationLevel.Warning,
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
        vi.spyOn(os, "platform").mockImplementationOnce(() => {
            return "win32";
        });

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

    it("doesn't normalize Windows paths on Linux", () => {
        vi.spyOn(os, "platform").mockImplementationOnce(() => {
            return "linux";
        });

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
