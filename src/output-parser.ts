import os from "node:os";
import path from "node:path";

import { debug } from "@actions/core";

import type {
    AnnotationWithMessageAndLevel,
    CargoMessage,
    CompilerMessage,
    CargoMessage as Message,
    Stats,
} from "./schema";
import { AnnotationLevel } from "./schema";

export class OutputParser {
    public readonly stats: Stats;

    public get annotations(): AnnotationWithMessageAndLevel[] {
        return this.uniqueAnnotations.values().toArray().flat();
    }

    private readonly uniqueAnnotations: Map<string, AnnotationWithMessageAndLevel[]>;
    private readonly workingDirectory: null | string;

    public constructor(workingDirectory?: string) {
        this.workingDirectory = workingDirectory ?? null;
        this.uniqueAnnotations = new Map();
        this.stats = {
            ice: 0,
            error: 0,
            warning: 0,
            note: 0,
            help: 0,
        };
    }

    public static parseCargoJson(line: string): Message | null {
        try {
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- trusted input
            return JSON.parse(line) as Message;
        } catch {
            return null;
        }
    }

    public static validateMessageIsCargoMessage(contents: CargoMessage): contents is CompilerMessage {
        if (contents.reason !== "compiler-message") {
            debug(`Unexpected reason field, ignoring it: ${contents.reason}`);
            return false;
        }

        if (contents.message?.code === undefined || contents.message.code === null) {
            debug("Message code is missing, ignoring it");
            return false;
        }

        return true;
    }

    private static parseLevel(level: string): AnnotationLevel {
        switch (level) {
            case "help":
            case "note": {
                return AnnotationLevel.Notice;
            }
            case "warning": {
                return AnnotationLevel.Warning;
            }
            default: {
                return AnnotationLevel.Error;
            }
        }
    }

    public tryParseClippyLine(line: string): void {
        const message = OutputParser.parseCargoJson(line);

        if (message === null) {
            debug("Not valid JSON or null, ignoring it");
            return;
        }

        if (!OutputParser.validateMessageIsCargoMessage(message)) {
            return;
        }

        const parsedAnnotations = this.makeAnnotations(message);

        const key = JSON.stringify(parsedAnnotations);

        if (this.uniqueAnnotations.has(key)) {
            return;
        }

        switch (message.message.level) {
            case "help": {
                this.stats.help += 1;
                break;
            }
            case "note": {
                this.stats.note += 1;
                break;
            }
            case "warning": {
                this.stats.warning += 1;
                break;
            }
            case "error": {
                this.stats.error += 1;
                break;
            }
            case "error: internal compiler error": {
                this.stats.ice += 1;
                break;
            }
            default: {
                break;
            }
        }

        this.uniqueAnnotations.set(key, parsedAnnotations);
    }

    /**
     * Convert parsed JSON line into GH annotation objects, one per primary span
     *
     * https://docs.github.com/en/rest/checks/runs#create-a-check-run
     *
     * @param {CompilerMessage} contents A cargo `compiler-message`.
     * @returns {AnnotationWithMessageAndLevel[]} One annotation per primary span, or a single span-less annotation.
     */
    private makeAnnotations(contents: CompilerMessage): AnnotationWithMessageAndLevel[] {
        const level = OutputParser.parseLevel(contents.message.level);

        const primarySpans = contents.message.spans.filter((span) => {
            return span.is_primary;
        });

        // Per https://doc.rust-lang.org/rustc/json.html, a top-level message
        // with one or more spans always has at least one primary span, so
        // this only matches span-less diagnostics, e.g. removed lints.
        if (primarySpans.length === 0) {
            return [
                {
                    level,
                    message: contents.message.rendered,
                    properties: {
                        title: contents.message.message,
                    },
                },
            ];
        }

        return primarySpans.map((primarySpan) => {
            let pathToFile = primarySpan.file_name;

            if (this.workingDirectory !== null) {
                pathToFile = path.join(this.workingDirectory, pathToFile);
            }

            if (os.platform() === "win32") {
                // `.\\foo\\bar.cs` to `./foo/bar.cs`
                pathToFile = pathToFile.split(path.win32.sep).join(path.posix.sep);
            }

            const annotation: AnnotationWithMessageAndLevel = {
                level,
                message: contents.message.rendered,
                properties: {
                    file: pathToFile,
                    startLine: primarySpan.line_start,
                    endLine: primarySpan.line_end,
                    title: contents.message.message,
                },
            };

            // GitHub annotations only support columns when the span is on a single line.
            // Workflow commands (::error etc.) silently drop the columns on a multi-line span,
            // but we omit them anyway to mirror the check-run API, which fails with a 422:
            // https://docs.github.com/en/rest/checks/runs#create-a-check-run
            if (primarySpan.line_start === primarySpan.line_end) {
                annotation.properties.startColumn = primarySpan.column_start;
                annotation.properties.endColumn = primarySpan.column_end;
            }

            return annotation;
        });
    }
}
