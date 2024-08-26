import path from "node:path";

import { fileURLToPath } from "node:url";

import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin-ts";
import tsParser from "@typescript-eslint/parser";
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

const disabledEslintRules = {
    "adjacent-overload-signatures": "off",
    "array-type": "off",
    "await-thenable": "off",
    "ban-tslint-comment": "off",
    "ban-types": "off",
    "class-literal-property-style": "off",
    "class-methods-use-this": "off",
    "consistent-generic-constructors": "off",
    "consistent-indexed-object-style": "off",
    "consistent-type-assertions": "off",
    "consistent-type-definitions": "off",
    "consistent-type-exports": "off",
    "consistent-type-imports": "off",
    "dot-notation": "off",
    "explicit-function-return-type": "off",
    "init-declarations": "off",
    "max-params": "off",
    "method-signature-style": "off",
    "naming-convention": "off",
    "no-array-constructor": "off",
    "no-array-delete": "off",
    "no-base-to-string": "off",
    "no-confusing-non-null-assertion": "off",
    "no-confusing-void-expression": "off",
    "no-dupe-class-members": "off",
    "no-duplicate-enum-values": "off",
    "no-duplicate-type-constituents": "off",
    "no-dynamic-delete": "off",
    "no-empty-function": "off",
    "no-empty-object-type": "off",
    "no-explicit-any": "off",
    "no-extra-non-null-assertion": "off",
    "no-extraneous-class": "off",
    "no-floating-promises": "off",
    "no-for-in-array": "off",
    "no-implied-eval": "off",
    "no-import-type-side-effects": "off",
    "no-inferrable-types": "off",
    "no-invalid-void-type": "off",
    "no-loop-func": "off",
    "no-loss-of-precision": "off",
    "no-misused-new": "off",
    "no-misused-promises": "off",
    "no-namespace": "off",
    "no-non-null-asserted-optional-chain": "off",
    "no-non-null-assertion": "off",
    "no-redeclare": "off",
    "no-this-alias": "off",
    "no-unnecessary-boolean-literal-compare": "off",
    "no-unnecessary-type-assertion": "off",
    "no-unnecessary-type-constraint": "off",
    "no-unsafe-argument": "off",
    "no-unused-expressions": "off",
    "no-unused-vars": "off",
    "no-use-before-define": "off",
    "no-useless-constructor": "off",
    "no-var-requires": "off",
    "non-nullable-type-assertion-style": "off",
    "only-throw-error": "off",
    "prefer-function-type": "off",
    "prefer-includes": "off",
    "prefer-nullish-coalescing": "off",
    "prefer-optional-chain": "off",
    "prefer-promise-reject-errors": "off",
    "prefer-readonly": "off",
    "prefer-reduce-type-parameter": "off",
    "prefer-return-this-type": "off",
    "promise-function-async": "off",
    "require-array-sort-compare": "off",
    "restrict-plus-operands": "off",
    "restrict-template-expressions": "off",
    "return-await": "off",
    "strict-boolean-expressions": "off",
    "triple-slash-reference": "off",
    "unbound-method": "off",
};

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
                project: "./tsconfig.json",
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
            "accessor-pairs": [
                "error",
                {
                    enforceForClassMembers: true,
                    getWithoutSet: false,
                    setWithoutGet: true,
                },
            ],
            "array-callback-return": [
                "error",
                {
                    allowImplicit: false,
                    allowVoid: false,
                    checkForEach: false,
                },
            ],
            "arrow-body-style": ["error", "always"],
            "class-methods-use-this": "off",
            "constructor-super": ["error"],
            curly: ["error", "all"],
            "default-case-last": ["error"],
            "eol-last": ["error", "always"],
            eqeqeq: ["error", "always"],

            "max-len": "off",
            "new-cap": [
                "error",
                {
                    capIsNew: false,
                    // eslint-disable-next-line unicorn/no-keyword-prefix
                    newIsCap: true,
                    properties: true,
                },
            ],
            "no-async-promise-executor": ["error"],
            "no-caller": ["error"],
            "no-case-declarations": ["error"],
            "no-class-assign": ["error"],
            "no-compare-neg-zero": ["error"],
            "no-cond-assign": ["error"],
            "no-const-assign": ["error"],
            "no-constant-condition": [
                "error",
                {
                    checkLoops: false,
                },
            ],
            "no-control-regex": ["error"],
            "no-debugger": ["error"],
            "no-delete-var": ["error"],
            "no-dupe-args": ["error"],
            "no-dupe-class-members": "off",
            "no-dupe-keys": ["error"],
            "no-duplicate-case": ["error"],
            "no-empty": [
                "error",
                {
                    allowEmptyCatch: true,
                },
            ],
            "no-empty-character-class": ["error"],
            "no-empty-pattern": ["error"],
            "no-eval": ["error"],
            "no-ex-assign": ["error"],
            "no-extend-native": ["error"],
            "no-extra-bind": ["error"],
            "no-extra-boolean-cast": ["error"],
            "no-extra-semi": "off",
            "no-fallthrough": ["error"],
            "no-func-assign": ["error"],
            "no-global-assign": ["error"],
            "no-import-assign": ["error"],
            "no-invalid-regexp": ["error"],
            "no-irregular-whitespace": ["error"],
            "no-iterator": ["error"],
            "no-labels": [
                "error",
                {
                    allowLoop: false,
                    allowSwitch: false,
                },
            ],
            "no-lone-blocks": ["error"],
            "no-misleading-character-class": ["error"],
            "no-multi-str": ["error"],
            "no-new": ["error"],
            "no-new-func": ["error"],
            "no-new-symbol": ["error"],
            "no-new-wrappers": ["error"],
            "no-obj-calls": ["error"],
            "no-object-constructor": ["error"],
            "no-octal": ["error"],
            "no-octal-escape": ["error"],
            "no-param-reassign": "off",
            "no-proto": ["error"],
            "no-prototype-builtins": ["error"],
            "no-regex-spaces": ["error"],
            "no-restricted-imports": [
                "error",
                {
                    patterns: [".*"],
                },
            ],
            "no-restricted-syntax": ["error", "DebuggerStatement", "LabeledStatement", "WithStatement"],
            "no-return-assign": ["error", "except-parens"],
            "no-return-await": "error",
            "no-self-assign": [
                "error",
                {
                    props: true,
                },
            ],
            "no-self-compare": ["error"],
            "no-sequences": ["error"],
            "no-shadow": "off",
            "no-shadow-restricted-names": ["error"],
            "no-sparse-arrays": ["error"],
            "no-template-curly-in-string": ["error"],
            "no-this-before-super": ["error"],
            "no-throw-literal": ["off"],
            "no-undef-init": ["error"],
            "no-underscore-dangle": "off",
            "no-unexpected-multiline": ["error"],
            "no-unmodified-loop-condition": ["error"],
            "no-unneeded-ternary": [
                "error",
                {
                    defaultAssignment: false,
                },
            ],
            "no-unreachable": ["error"],
            "no-unreachable-loop": ["error"],
            "no-unsafe-finally": ["error"],
            "no-unsafe-negation": ["error"],
            "no-unused-expressions": "error",
            "no-use-before-define": "off",
            "no-useless-backreference": ["error"],
            "no-useless-call": ["error"],
            "no-useless-catch": ["error"],
            "no-useless-computed-key": ["error"],
            "no-useless-constructor": "off",
            "no-useless-escape": ["error"],
            "no-useless-rename": ["error"],
            "no-useless-return": ["error"],
            "no-var": ["error"],
            "no-void": [
                "error",
                {
                    allowAsStatement: true,
                },
            ],
            "no-with": ["error"],
            "object-shorthand": ["error", "always"],
            "one-var": [
                "error",
                {
                    initialized: "never",
                },
            ],
            "prefer-const": [
                "error",
                {
                    destructuring: "all",
                    ignoreReadBeforeAssign: false,
                },
            ],
            "prefer-regex-literals": [
                "error",
                {
                    disallowRedundantWrapping: true,
                },
            ],
            "prefer-template": "error",
            quotes: [
                "error",
                "double",
                {
                    allowTemplateLiterals: false,
                    avoidEscape: true,
                },
            ],
            "require-await": "error",
            "sort-imports": [
                "error",
                {
                    ignoreDeclarationSort: true,
                },
            ],
            "sort-keys": ["off"],
            "symbol-description": ["error"],
            "unicode-bom": ["error", "never"],
            "unicorn/no-null": "off",
            "unicorn/prefer-ternary": "off",
            "use-isnan": [
                "error",
                {
                    enforceForIndexOf: true,
                    enforceForSwitchCase: true,
                },
            ],
            "valid-typeof": [
                "error",
                {
                    requireStringLiterals: true,
                },
            ],
            yoda: ["error", "never"],

            "import-x/extensions": [
                "error",
                "never",
                {
                    json: "always",
                },
            ],
            "import-x/newline-after-import": "error",
            "import-x/no-cycle": "off",
            "import-x/no-duplicates": "error",
            "import-x/no-extraneous-dependencies": "off",
            "import-x/no-relative-packages": "error",
            "import-x/no-unresolved": "error",
            "import-x/order": [
                "error",
                {
                    alphabetize: { caseInsensitive: true, order: "asc" },
                    "newlines-between": "always-and-inside-groups",
                },
            ],
            "import-x/prefer-default-export": "off",
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
                    extensions: [".d.ts", ".ts"],
                },
                typescript: {
                    alwaysTryTypes: true,
                },
            },
        },
        rules: {
            ...disabledEslintRules,
            ...importPlugin.configs.typescript.rules,
            // ...eslintPluginUnicorn.configs.recommended.rules,
            "@stylistic/ts/no-extra-semi": "error",
            "@typescript-eslint/adjacent-overload-signatures": ["error"],
            "@typescript-eslint/array-type": ["error", { default: "array" }],
            "@typescript-eslint/await-thenable": ["error"],
            "@typescript-eslint/ban-ts-comment": [
                "error",
                {
                    minimumDescriptionLength: 3,
                    "ts-check": false,
                    "ts-expect-error": "allow-with-description",
                    "ts-ignore": true,
                    "ts-nocheck": true,
                },
            ],
            "@typescript-eslint/ban-tslint-comment": ["error"],
            "@typescript-eslint/class-literal-property-style": ["error", "fields"],
            "@typescript-eslint/class-methods-use-this": [
                "error",
                {
                    enforceForClassFields: true,
                    exceptMethods: [],
                    ignoreClassesThatImplementAnInterface: false,
                    ignoreOverrideMethods: false,
                },
            ],
            "@typescript-eslint/consistent-generic-constructors": ["error", "constructor"],
            "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
            "@typescript-eslint/consistent-type-assertions": [
                "error",
                {
                    assertionStyle: "as",
                    objectLiteralTypeAssertions: "never",
                },
            ],
            "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
            "@typescript-eslint/consistent-type-exports": [
                "error",
                {
                    fixMixedExportsWithInlineTypeSpecifier: true,
                },
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    disallowTypeAnnotations: false,
                    fixStyle: "separate-type-imports",
                    prefer: "type-imports",
                },
            ],
            "@typescript-eslint/dot-notation": [
                "error",
                {
                    allowIndexSignaturePropertyAccess: false,
                    allowKeywords: true,
                    allowPattern: "",
                    allowPrivateClassPropertyAccess: false,
                    allowProtectedClassPropertyAccess: false,
                },
            ],
            "@typescript-eslint/explicit-function-return-type": [
                "off",
                // "error",
                // {
                //     allowExpressions: false,
                //     allowHigherOrderFunctions: false,
                //     allowTypedFunctionExpressions: false,
                //     allowDirectConstAssertionInArrowFunctions: false,
                // },
            ],
            "@typescript-eslint/explicit-member-accessibility": ["error"],

            "@typescript-eslint/explicit-module-boundary-types": "error",
            "@typescript-eslint/init-declarations": ["error", "always"],
            "@typescript-eslint/max-params": ["error", { max: 4 }],

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
            "@typescript-eslint/method-signature-style": ["error"],
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
            "@typescript-eslint/no-array-constructor": ["error"],
            "@typescript-eslint/no-array-delete": ["error"],
            "@typescript-eslint/no-base-to-string": ["error"],
            "@typescript-eslint/no-confusing-non-null-assertion": ["error"],
            "@typescript-eslint/no-confusing-void-expression": [
                "error",
                { ignoreArrowShorthand: false, ignoreVoidOperator: false },
            ],
            "@typescript-eslint/no-dupe-class-members": ["error"],
            "@typescript-eslint/no-duplicate-enum-values": ["error"],
            "@typescript-eslint/no-duplicate-type-constituents": [
                "error",
                { ignoreIntersections: false, ignoreUnions: false },
            ],
            "@typescript-eslint/no-dynamic-delete": ["error"],
            "@typescript-eslint/no-empty-function": [
                "error",
                {
                    allow: [],
                },
            ],
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/no-empty-object-type": ["error"],
            "@typescript-eslint/no-explicit-any": ["error", { fixToUnknown: true, ignoreRestArgs: false }],
            "@typescript-eslint/no-extra-non-null-assertion": ["error"],
            "@typescript-eslint/no-extraneous-class": "error",
            "@typescript-eslint/no-floating-promises": ["error"],
            "@typescript-eslint/no-for-in-array": ["error"],
            "@typescript-eslint/no-implied-eval": ["error"],
            "@typescript-eslint/no-import-type-side-effects": ["error"],
            "@typescript-eslint/no-inferrable-types": ["error", { ignoreParameters: false, ignoreProperties: false }],
            "@typescript-eslint/no-invalid-void-type": ["error"],
            "@typescript-eslint/no-loop-func": ["error"],
            "@typescript-eslint/no-loss-of-precision": ["error"],
            "@typescript-eslint/no-misused-new": ["error"],
            "@typescript-eslint/no-misused-promises": ["error"],
            "@typescript-eslint/no-namespace": ["error"],
            "@typescript-eslint/no-non-null-asserted-optional-chain": ["error"],
            "@typescript-eslint/no-non-null-assertion": ["error"],
            "@typescript-eslint/no-redeclare": ["error", { builtinGlobals: false }],
            "@typescript-eslint/no-require-imports": "error",
            "@typescript-eslint/no-shadow": "error",
            "@typescript-eslint/no-this-alias": ["error", { allowDestructuring: true }],
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": ["error"],
            "@typescript-eslint/no-unnecessary-type-assertion": ["error"],
            "@typescript-eslint/no-unnecessary-type-constraint": ["error"],
            "@typescript-eslint/no-unsafe-argument": ["error"],
            "@typescript-eslint/no-unsafe-function-type": ["error"],
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
            "@typescript-eslint/no-use-before-define": [
                "error",
                {
                    classes: false,
                    enums: false,
                    functions: false,
                    typedefs: false,
                    variables: false,
                },
            ],
            "@typescript-eslint/no-useless-constructor": ["error"],
            "@typescript-eslint/no-var-requires": ["error"],
            "@typescript-eslint/no-wrapper-object-types": ["error"],
            "@typescript-eslint/non-nullable-type-assertion-style": ["error"],
            "@typescript-eslint/only-throw-error": ["error", { allowThrowingAny: false, allowThrowingUnknown: false }],
            "@typescript-eslint/parameter-properties": "error",
            "@typescript-eslint/prefer-for-of": "error",
            "@typescript-eslint/prefer-function-type": ["error"],
            "@typescript-eslint/prefer-includes": ["error"],
            "@typescript-eslint/prefer-nullish-coalescing": [
                "error",
                { ignoreConditionalTests: false, ignoreMixedLogicalExpressions: false },
            ],
            "@typescript-eslint/prefer-optional-chain": ["error"],
            "@typescript-eslint/prefer-promise-reject-errors": ["error"],
            "@typescript-eslint/prefer-readonly": ["error"],
            "@typescript-eslint/prefer-reduce-type-parameter": ["error"],
            "@typescript-eslint/prefer-regexp-exec": "warn",
            "@typescript-eslint/prefer-return-this-type": ["error"],
            "@typescript-eslint/prefer-string-starts-ends-with": "error",
            "@typescript-eslint/promise-function-async": "off",
            "@typescript-eslint/require-array-sort-compare": ["error", { ignoreStringArrays: true }],
            "@typescript-eslint/require-await": "error",
            "@typescript-eslint/restrict-plus-operands": ["error", { skipCompoundAssignments: false }],
            "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
            "@typescript-eslint/return-await": ["error", "always"],
            "@typescript-eslint/sort-type-constituents": "error",
            "@typescript-eslint/strict-boolean-expressions": [
                "error",
                {
                    allowAny: false,
                    allowNullableBoolean: false,
                    allowNullableNumber: false,
                    allowNullableObject: false,
                    allowNullableString: false,
                    allowNumber: false,
                    allowString: false,
                },
            ],
            "@typescript-eslint/triple-slash-reference": ["error", { lib: "never", path: "never", types: "never" }],

            "@typescript-eslint/unbound-method": "error",
            "@typescript-eslint/unified-signatures": "error",

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
