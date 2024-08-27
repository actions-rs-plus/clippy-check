import path from "node:path";

import { fileURLToPath } from "node:url";

import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin-ts";
import tsParser from "@typescript-eslint/parser";
import love from "eslint-config-love";
import importPlugin from "eslint-plugin-import-x";
import nPlugin from "eslint-plugin-n";
import prettier from "eslint-plugin-prettier/recommended";
import promise from "eslint-plugin-promise";

import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    allConfig: js.configs.all,
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

function fixUpLoveRules() {
    const rules = {};

    const regex = new RegExp(/^import\//);

    for (const [key, value] of Object.entries(love.rules)) {
        rules[key.replace(regex, "import-x/")] = value;
    }

    return rules;
}

export default tseslint.config(
    ...fixupConfigRules(compat.extends("eslint:recommended")),
    {
        ignores: ["dist/**", "reports/**", "coverage/**"],
    },
    eslintPluginUnicorn.configs["flat/all"],
    {
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                projectService: true,
                sourceType: "module", // Allows for the use of imports
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "import-x": importPlugin,
        },
        settings: {
            "import-x/resolver": {
                node: {
                    extensions: [".d.ts", ".ts"],
                },
                typescript: {
                    alwaysTryTypes: true,
                },
            },
        },
        rules: {
            ...importPlugin.configs.recommended.rules,
            ...eslintPluginUnicorn.configs.recommended.rules,

            "import-x/export": ["error"],
            "import-x/first": ["error"],
            "import-x/no-absolute-path": ["error", { esmodule: true, commonjs: true, amd: false }],
            "import-x/no-duplicates": ["error"],
            "import-x/no-named-default": ["error"],
            "import-x/no-webpack-loader-syntax": ["error"],
            "arrow-body-style": ["error", "always"],

            curly: ["error", "all"],
            "eol-last": ["error", "always"],
            eqeqeq: ["error", "always"],

            "max-len": ["off"],
            "no-dupe-keys": ["warn"],
            "no-extra-semi": ["off"],
            "no-param-reassign": ["off"],
            "no-restricted-syntax": ["error", "DebuggerStatement", "LabeledStatement", "WithStatement"],
            "no-return-await": ["error"],
            "no-shadow": ["error"],
            "no-underscore-dangle": ["off"],
            "no-unused-expressions": ["error"],
            "no-useless-constructor": ["off"],
            "object-shorthand": ["error", "always"],
            "prefer-const": ["error"],
            "prefer-template": ["error"],
            quotes: [
                "error",
                "double",
                {
                    allowTemplateLiterals: false,
                    avoidEscape: true,
                },
            ],
            "require-await": ["error"],
            "sort-imports": [
                "error",
                {
                    ignoreDeclarationSort: true,
                },
            ],

            "sort-keys": ["off"],
            "unicorn/no-null": ["off"],
            "unicorn/prefer-ternary": ["off"],

            "import-x/extensions": [
                "error",
                "never",
                {
                    json: "always",
                },
            ],
            "import-x/newline-after-import": ["error"],
            "import-x/no-cycle": ["off"],
            "import-x/no-extraneous-dependencies": ["off"],
            "import-x/no-relative-packages": ["error"],
            "import-x/no-unresolved": ["error"],
            "import-x/order": [
                "error",
                {
                    alphabetize: { caseInsensitive: true, order: "asc" },
                    "newlines-between": "always-and-inside-groups",
                },
            ],
            "import-x/prefer-default-export": ["off"],
        },
    },
    ...tseslint.configs.strictTypeChecked,
    {
        files: ["**/*.ts", "**/*.tsx"],
        ignores: ["**/*.mjs"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "./tsconfig.json",
                projectService: true,
                sourceType: "module", // Allows for the use of imports
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "@stylistic/ts": stylistic,
            "import-x": importPlugin,
            n: nPlugin,
            promise,
        },
        settings: {
            "import-x/resolver": {
                node: {
                    extensions: [".ts"],
                },
                typescript: {
                    alwaysTryTypes: true,
                },
            },
        },
        rules: {
            ...importPlugin.configs.typescript.rules,
            ...fixUpLoveRules(),

            "@stylistic/ts/no-extra-semi": ["error"],
            "@typescript-eslint/array-type": ["error", { default: "array" }],

            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    disallowTypeAnnotations: false,
                    fixStyle: "separate-type-imports",
                    prefer: "type-imports",
                },
            ],

            "@typescript-eslint/explicit-member-accessibility": ["error"],

            "@typescript-eslint/explicit-module-boundary-types": ["error"],

            "@typescript-eslint/member-ordering": [
                "error",
                {
                    default: [
                        // Index signature
                        "signature",
                        // Fields
                        "private-field",
                        "public-field",
                        "protected-field",
                        // Constructors
                        "public-constructor",
                        "protected-constructor",
                        "private-constructor",
                        // Methods
                        "public-method",
                        "protected-method",
                        "private-method",
                    ],
                },
            ],
            "@typescript-eslint/naming-convention": [
                "error",
                // {
                //     format: ["camelCase", "PascalCase", "UPPER_CASE"],
                //     leadingUnderscore: "allow",
                //     selector: "variableLike",
                //     trailingUnderscore: "allow",
                // },
                {
                    format: ["camelCase", "PascalCase", "UPPER_CASE"],
                    selector: "enumMember",
                },
            ],
            "@typescript-eslint/no-empty-interface": ["error"],
            "@typescript-eslint/no-empty-object-type": ["error"],
            "@typescript-eslint/no-explicit-any": ["error", { fixToUnknown: true, ignoreRestArgs: false }],
            "@typescript-eslint/no-extraneous-class": ["error"],
            "@typescript-eslint/no-shadow": ["error"],
            "@typescript-eslint/no-unused-expressions": [
                "error",
                {
                    allowShortCircuit: false,
                    allowTaggedTemplates: false,
                    allowTernary: false,
                    enforceForJSX: false,
                },
            ],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    args: "all",
                    argsIgnorePattern: "^_",
                    caughtErrors: "all",
                    ignoreRestSiblings: false,
                    vars: "all",
                },
            ],
            "@typescript-eslint/parameter-properties": ["error"],
            "@typescript-eslint/prefer-for-of": ["error"],

            "@typescript-eslint/prefer-regexp-exec": ["warn"],
            "@typescript-eslint/prefer-string-starts-ends-with": ["error"],
            "@typescript-eslint/promise-function-async": ["off"],
            "@typescript-eslint/require-await": ["error"],
            "@typescript-eslint/sort-type-constituents": ["error"],

            "@typescript-eslint/unified-signatures": ["error"],

            "import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],

            "n/handle-callback-err": ["error", "^(err|error)$"],
            "n/no-callback-literal": ["error"],
            "n/no-deprecated-api": ["error"],
            "n/no-exports-assign": ["error"],
            "n/no-new-require": ["error"],
            "n/no-path-concat": ["error"],
            "n/process-exit-as-throw": ["error"],
            "promise/param-names": ["error"],
        },
    },

    {
        extends: [tseslint.configs.disableTypeChecked],
        files: ["*.mjs"],
        rules: {},
    },
    prettier,
);
