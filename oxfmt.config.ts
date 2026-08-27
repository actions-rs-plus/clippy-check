import type { OxfmtConfig } from "oxfmt";
import { defineConfig } from "oxfmt";

const config: OxfmtConfig = defineConfig({
    arrowParens: "always",
    bracketSpacing: true,
    jsdoc: true,
    printWidth: 120,
    quoteProps: "as-needed",
    semi: true,
    singleQuote: false,
    sortImports: true,
    tabWidth: 4,
    trailingComma: "all",
    useTabs: false,
    ignorePatterns: ["CHANGELOG.md", "dist/"],
    overrides: [
        {
            files: ["*.json"],
            options: {
                printWidth: 80,
                trailingComma: "none",
            },
        },
        {
            files: ["*.toml"],
            options: {
                printWidth: 80,
            },
        },
        {
            files: ["*.md", "*.yaml", "*.yml"],
            options: {
                tabWidth: 2,
            },
        },
    ],
});

export default config;
