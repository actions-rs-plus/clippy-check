import * as core from "@actions/core";

import type { AnnotationWithMessageAndLevel, Context, Stats } from "@/schema";
import { AnnotationLevel } from "@/schema";

export class Reporter {
    public async report(stats: Stats, annotations: AnnotationWithMessageAndLevel[], context: Context): Promise<void> {
        for (const annotation of annotations) {
            switch (annotation.level) {
                case AnnotationLevel.Error: {
                    core.error(annotation.message, annotation.properties);
                    break;
                }
                case AnnotationLevel.Notice: {
                    core.notice(annotation.message, annotation.properties);
                    break;
                }
                case AnnotationLevel.Warning: {
                    core.warning(annotation.message, annotation.properties);
                    break;
                }
            }
        }

        core.summary.addHeading("Clippy summary", 2);
        core.summary.addTable([
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

        core.summary.addHeading("Versions", 2);
        core.summary.addList([context.rustc, context.cargo, context.clippy]);

        await core.summary.write();
    }
}
