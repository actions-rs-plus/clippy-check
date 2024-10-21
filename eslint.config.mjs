import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin-ts";
import tsParser from "@typescript-eslint/parser";
import love from "eslint-config-love";
import importPlugin from "eslint-plugin-import";
import nPlugin from "eslint-plugin-n";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier/recommended";
import promise from "eslint-plugin-promise";

import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    js.configs.recommended,
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
            import: importPlugin,
        },
        settings: {
            "import/resolver": {
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

            "import/export": ["error"],
            "import/first": ["error"],
            "import/no-absolute-path": ["error", { esmodule: true, commonjs: true, amd: false }],
            "import/no-duplicates": ["error"],
            "import/no-named-default": ["error"],
            "import/no-webpack-loader-syntax": ["error"],
            "arrow-body-style": ["error", "always"],

            curly: ["error", "all"],
            "eol-last": ["error", "always"],
            eqeqeq: ["error", "always"],

            "max-len": ["off"],
            "no-dupe-keys": ["warn"],
            "no-extra-semi": ["off"],
            "no-param-reassign": ["off"],
            "no-restricted-imports": [
                "error",
                {
                    patterns: [".*"],
                },
            ],
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

            "import/extensions": [
                "error",
                "never",
                {
                    json: "always",
                },
            ],
            "import/newline-after-import": ["error"],
            "import/no-cycle": ["off"],
            "import/no-extraneous-dependencies": ["off"],
            "import/no-relative-packages": ["error"],
            "import/no-unresolved": ["error"],
            "import/order": [
                "error",
                {
                    alphabetize: { caseInsensitive: true, order: "asc" },
                    "newlines-between": "always-and-inside-groups",
                },
            ],
            "import/prefer-default-export": ["off"],
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
            import: importPlugin,
            n: nPlugin,
            promise,
            perfectionist,
        },
        settings: {
            "import/resolver": {
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
            ...love.rules,

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

            "@typescript-eslint/prefer-destructuring": ["off"],

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
            "@typescript-eslint/no-empty-object-type": ["error"],
            "@typescript-eslint/no-explicit-any": ["error", { fixToUnknown: true, ignoreRestArgs: false }],
            "@typescript-eslint/no-extraneous-class": ["error"],
            "@typescript-eslint/no-magic-numbers": ["off"],
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

            "@typescript-eslint/unified-signatures": ["error"],

            "import/consistent-type-specifier-style": ["error", "prefer-top-level"],

            "n/handle-callback-err": ["error", "^(err|error)$"],
            "n/no-callback-literal": ["error"],
            "n/no-deprecated-api": ["error"],
            "n/no-exports-assign": ["error"],
            "n/no-new-require": ["error"],
            "n/no-path-concat": ["error"],
            "n/process-exit-as-throw": ["error"],

            "perfectionist/sort-intersection-types": ["error"],
            "perfectionist/sort-union-types": ["error"],

            "promise/param-names": ["error"],
        },
    },

    {
        extends: [tseslint.configs.disableTypeChecked],
        files: ["*.js", "*.mjs"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {},
    },
    prettier,
);
