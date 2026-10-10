import type { AnnotationProperties } from "@actions/core";
import { error, notice, summary, warning } from "@actions/core";

import type { AnnotationWithMessageAndLevel, Context, Stats } from "./schema";
import { AnnotationLevel } from "./schema";

function logAnnotation(annotation: AnnotationWithMessageAndLevel): void {
    switch (annotation.level) {
        case AnnotationLevel.Error: {
            error(annotation.message, annotation.properties);
            break;
        }
        case AnnotationLevel.Notice: {
            notice(annotation.message, annotation.properties);
            break;
        }
        case AnnotationLevel.Warning: {
            warning(annotation.message, annotation.properties);
            break;
        }
    }
}

function formatLevel(level: AnnotationLevel): string {
    switch (level) {
        case AnnotationLevel.Error: {
            return "Error";
        }
        case AnnotationLevel.Notice: {
            return "Notice";
        }
        case AnnotationLevel.Warning: {
            return "Warning";
        }
    }
}

function escapeHtml(text: string): string {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function formatLocation(properties: AnnotationProperties): string {
    if (properties.file === undefined) {
        return "";
    }

    return `${properties.file}:${String(properties.startLine)}`;
}

export async function report(
    stats: Stats,
    annotations: AnnotationWithMessageAndLevel[],
    context: Context,
): Promise<void> {
    for (const annotation of annotations) {
        logAnnotation(annotation);
    }

    summary.addHeading("Clippy summary", 2);
    summary.addTable([
        [
            {
                header: true,
                data: "Message level",
            },
            {
                header: true,
                data: "Amount",
            },
        ],
        [
            {
                data: "Internal compiler error",
            },
            {
                data: stats.ice.toString(),
            },
        ],
        [
            {
                data: "Error",
            },
            {
                data: stats.error.toString(),
            },
        ],
        [
            {
                data: "Warning",
            },
            {
                data: stats.warning.toString(),
            },
        ],
        [
            {
                data: "Note",
            },
            {
                data: stats.note.toString(),
            },
        ],
        [
            {
                data: "Help",
            },
            {
                data: stats.help.toString(),
            },
        ],
    ]);

    if (annotations.length > 0) {
        summary.addHeading("Diagnostics", 2);
        summary.addTable([
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
            ...annotations.map((annotation) => {
                return [
                    formatLevel(annotation.level),
                    escapeHtml(formatLocation(annotation.properties)),
                    escapeHtml(annotation.properties.title ?? ""),
                ];
            }),
        ]);
    }

    summary.addHeading("Versions", 2);
    summary.addList([context.rustc, context.cargo, context.clippy]);

    await summary.write();
}
