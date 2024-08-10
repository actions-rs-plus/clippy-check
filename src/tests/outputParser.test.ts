import { OutputParser } from "outputParser";
import type { CargoMessage, MaybeCargoMessage, Stats } from "schema";

jest.mock("@actions/core");

describe("outputParser", () => {
    const emptyStats: Stats = {
        error: 0,
        warning: 0,
        note: 0,
        ice: 0,
        help: 0,
    };

    const defaultMessage: CargoMessage = {
        reason: "compiler-message",
        message: {
            code: "code",
            message: "message",
            rendered: "rendered",
            level: "warning",
            spans: [
                {
                    // biome-ignore lint/style/useNamingConvention: contract
                    is_primary: true,
                    // biome-ignore lint/style/useNamingConvention: contract
                    column_start: 10,
                    // biome-ignore lint/style/useNamingConvention: contract
                    column_end: 15,
                    // biome-ignore lint/style/useNamingConvention: contract
                    line_start: 30,
                    // biome-ignore lint/style/useNamingConvention: contract
                    // biome-ignore lint/style/useNamingConvention: contract
                    line_end: 30,
                    // biome-ignore lint/style/useNamingConvention: contract
                    file_name: "main.rs",
                },
            ],
        },
    };

    it("ignores invalid json", () => {
        const outputParser = new OutputParser();

        outputParser.tryParseClippyLine("I am not valid json");

        expect(outputParser.stats).toEqual(emptyStats);
    });

    it("ignores non-compiler-messages", () => {
        const outputParser = new OutputParser();

        const output: MaybeCargoMessage = {
            reason: "not-a-compiler-message",
        };

        outputParser.tryParseClippyLine(JSON.stringify(output));

        expect(outputParser.stats).toEqual(emptyStats);
    });

    it("ignores when compiler-message doesn't have a code", () => {
        const outputParser = new OutputParser();

        const output: MaybeCargoMessage = {
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

        const output: CargoMessage = {
            reason: defaultMessage.reason,
            message: {
                ...defaultMessage.message,
                level,
            },
        };

        outputParser.tryParseClippyLine(JSON.stringify(output));

        expect(outputParser.stats).toEqual({
            ...emptyStats,
            [test ?? level]: 1,
        });
    });

    it("ignores when level is not help, note, warning, error, ice", () => {
        const outputParser = new OutputParser();

        const output: CargoMessage = {
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

        expect(outputParser.stats).toEqual({
            ...emptyStats,
            [defaultMessage.message.level]: 1,
        });
    });

    it("fails when primary span cannot be found", () => {
        const outputParser = new OutputParser();

        const output: CargoMessage = {
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

    it("parses annotations into AnnotationWithMessageAndLevel", () => {
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
});
