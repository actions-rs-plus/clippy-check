import nodePath from "node:path";

import * as core from "@actions/core";

import type { AnnotationWithMessageAndLevel, CargoMessage, MaybeCargoMessage, Stats } from "@/schema";
import { AnnotationLevel } from "@/schema";

export class OutputParser {
    private readonly _workingDirectory: string | null;
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

    public tryParseClippyLine(line: string): void {
        let contents: MaybeCargoMessage;
        try {
            contents = JSON.parse(line);
        } catch {
            core.debug("Not a JSON, ignoring it");
            return;
        }

        if (contents.reason !== "compiler-message") {
            core.debug(`Unexpected reason field, ignoring it: ${contents.reason}`);
            return;
        }

        if (!contents.message?.code) {
            core.debug("Message code is missing, ignoring it");
            return;
        }

        const cargoMessage = contents as CargoMessage;

        const parsedAnnotation = this.makeAnnotation(cargoMessage);

        const key = JSON.stringify(parsedAnnotation);

        if (this._uniqueAnnotations.has(key)) {
            return;
        }

        switch (contents.message.level) {
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

    /// Convert parsed JSON line into the GH annotation object
    ///
    /// https://developer.github.com/v3/checks/runs/#annotations-object
    private makeAnnotation(contents: CargoMessage): AnnotationWithMessageAndLevel {
        const primarySpan = contents.message.spans.find((span) => {
            return span.is_primary;
        });

        // TODO: Handle it properly
        if (!primarySpan) {
            throw new Error("Unable to find primary span for message");
        }

        let path = primarySpan.file_name;

        if (this._workingDirectory) {
            path = nodePath.join(this._workingDirectory, path);
        }

        const annotation: AnnotationWithMessageAndLevel = {
            level: OutputParser.parseLevel(contents.message.level),
            message: contents.message.rendered,
            properties: {
                file: path,
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
