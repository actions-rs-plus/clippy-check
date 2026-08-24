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

    summary.addHeading("Versions", 2);
    summary.addList([context.rustc, context.cargo, context.clippy]);

    await summary.write();
}
