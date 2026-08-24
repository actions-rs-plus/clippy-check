type DirectiveType = "disable-line" | "disable-next-line" | "disable" | "enable";

interface Directive {
    justification: string;
    node: object;
    type: DirectiveType;
}

interface RuleContext {
    report: (descriptor: { message: string; node: object }) => void;
    sourceCode: {
        getDisableDirectives: () => { directives: Directive[] };
    };
}

interface Plugin {
    meta: { name: string };
    rules: Record<string, { create: (context: RuleContext) => Record<string, () => void> }>;
}

const plugin: Plugin = {
    meta: {
        name: "local",
    },
    rules: {
        "require-disable-directive-description": {
            create(context: RuleContext): Record<string, () => void> {
                return {
                    Program(): void {
                        for (const directive of context.sourceCode.getDisableDirectives().directives) {
                            if (directive.type !== "enable" && directive.justification === "") {
                                context.report({
                                    message: "Disable directive requires a description (`-- reason`).",
                                    node: directive.node,
                                });
                            }
                        }
                    },
                };
            },
        },
    },
};

export default plugin;
