declare module "eslint-plugin-promise" {
    import type { Linter } from "eslint";

    interface Ruleset {
        rules: Linter.RulesRecord;
    }

    type Configs = {
        recommended: Ruleset;
        "flat/recommended": Ruleset;
    } & Record<string, Ruleset>;

    interface Plugin {
        configs: Configs;
    }

    const plugin: Plugin;

    export default plugin;
}
