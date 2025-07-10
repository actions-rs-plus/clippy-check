import os from "node:os";
import path from "node:path";

import * as core from "@actions/core";

import type {
    AnnotationWithMessageAndLevel,
    CargoMessage,
    CompilerMessage,
    CargoMessage as Message,
    Stats,
} from "@/schema.ts";
import { AnnotationLevel } from "@/schema.ts";

export class OutputParser {
    private readonly _workingDirectory: null | string;
    private readonly _uniqueAnnotations: Map<string, AnnotationWithMessageAndLevel>;
    private readonly _stats: Stats;

    public constructor(workingDirectory?: string) {
        this._workingDirectory = workingDirectory ?? null;
        this._uniqueAnnotations = new Map();
        this._stats = {
            ice: 0,
            error: 0,
            warning: 0,
            note: 0,
            help: 0,
        };
    }

    public get stats(): Stats {
        return this._stats;
    }

    public get annotations(): AnnotationWithMessageAndLevel[] {
        return [...this._uniqueAnnotations.values()];
    }

    public static parseCargoJson(line: string): Message | null {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- I am not checking each property manually
            return JSON.parse(line) as Message;
        } catch {
            return null;
        }
    }

    public static validateMessageIsCargoMessage(contents: CargoMessage): contents is CompilerMessage {
        if (contents.reason !== "compiler-message") {
            core.debug(`Unexpected reason field, ignoring it: ${contents.reason}`);
            return false;
        }

        if (contents.message?.code === undefined || contents.message.code === null) {
            core.debug("Message code is missing, ignoring it");
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
            core.debug("Not valid JSON or null, ignoring it");
            return;
        }

        if (!OutputParser.validateMessageIsCargoMessage(message)) {
            return;
        }

        const parsedAnnotation = this.makeAnnotation(message);

        const key = JSON.stringify(parsedAnnotation);

        if (this._uniqueAnnotations.has(key)) {
            return;
        }

        switch (message.message.level) {
            case "help": {
                this._stats.help += 1;
                break;
            }
            case "note": {
                this._stats.note += 1;
                break;
            }
            case "warning": {
                this._stats.warning += 1;
                break;
            }
            case "error": {
                this._stats.error += 1;
                break;
            }
            case "error: internal compiler error": {
                this._stats.ice += 1;
                break;
            }
            default: {
                break;
            }
        }

        this._uniqueAnnotations.set(key, parsedAnnotation);
    }

    /// Convert parsed JSON line into the GH annotation object
    ///
    /// https://developer.github.com/v3/checks/runs/#annotations-object
    private makeAnnotation(contents: CompilerMessage): AnnotationWithMessageAndLevel {
        const primarySpan = contents.message.spans.find((span) => {
            return span.is_primary;
        });

        // TODO: Handle it properly
        if (primarySpan === undefined) {
            throw new Error("Unable to find primary span for message");
        }

        let pathToFile = primarySpan.file_name;

        if (this._workingDirectory !== null) {
            pathToFile = path.join(this._workingDirectory, pathToFile);
        }

        if (os.platform() === "win32") {
            // `.\\foo\\bar.cs` to `./foo/bar.cs`
            pathToFile = pathToFile.split(path.win32.sep).join(path.posix.sep);
        }

        const annotation: AnnotationWithMessageAndLevel = {
            level: OutputParser.parseLevel(contents.message.level),
            message: contents.message.rendered,
            properties: {
                file: pathToFile,
                startLine: primarySpan.line_start,
                endLine: primarySpan.line_end,
                title: contents.message.message,
            },
        };

        // Omit these parameters if `start_line` and `end_line` have different values.
        if (primarySpan.line_start === primarySpan.line_end) {
            annotation.properties.startColumn = primarySpan.column_start;
            annotation.properties.endColumn = primarySpan.column_end;
        }

        return annotation;
    }
}
