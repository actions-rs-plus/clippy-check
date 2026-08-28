import type { OxlintConfig } from "oxlint";
import { defineConfig } from "oxlint";

const plugins = ["eslint", "import", "jsdoc", "node", "oxc", "promise", "typescript", "unicorn"] satisfies NonNullable<
    OxlintConfig["plugins"]
>;

const config: OxlintConfig = defineConfig({
    plugins,
    jsPlugins: [
        "./oxlint.plugin.ts",
        {
            name: "n",
            specifier: "eslint-plugin-n",
        },
        "eslint-plugin-perfectionist",
    ],
    categories: {
        correctness: "error",
        nursery: "off",
        pedantic: "error",
        perf: "error",
        restriction: "error",
        style: "error",
        suspicious: "error",
    },
    options: {
        denyWarnings: true,
        reportUnusedDisableDirectives: "error",
        typeAware: true,
        typeCheck: true,
    },
    env: {
        es2026: true,
        node: true,
    },
    ignorePatterns: ["dist/", "coverage/", "reports/", ".local/", ".pnpm-store/"],
    rules: {
        "arrow-body-style": ["error", "always"],
        "capitalized-comments": "off",
        curly: ["error", "all"],
        // a default arm would silence typescript/switch-exhaustiveness-check
        "default-case": "off",
        eqeqeq: ["error", "always"],
        "func-style": ["error", "declaration", { allowArrowFunctions: true }],
        "id-length": ["error", { exceptions: ["x", "y"] }],
        "max-lines": "off",
        "max-lines-per-function": ["error", { max: 100 }],
        "max-params": ["error", { max: 4 }],
        "max-statements": ["error", { max: 25 }],
        "no-alert": "error",
        "no-console": ["error", { allow: ["error", "warn"] }],
        "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
        "no-inline-comments": "off",
        // tsc reports redeclarations (ts2451); this rule also flags a type and a value sharing a name, which TypeScript allows
        "no-redeclare": "off",
        "no-ternary": "off",
        "no-undefined": "off",
        "no-unreachable-loop": "error",
        // allow TODO
        "no-warning-comments": ["error", { location: "anywhere", terms: ["fixme", "xxx"] }],
        "one-var": ["error", "never"],
        // destructuring a later array index needs a hole in the pattern (`const [, second] = ...`)
        "prefer-destructuring": ["error", { array: false, object: true }],
        "require-await": "off",
        // perfectionist/sort-named-imports orders the members
        "sort-imports": "off",
        "sort-keys": "off",
        "no-restricted-globals": ["error"],
        "no-shadow": "error",
        "no-use-before-define": [
            "error",
            {
                classes: true,
                enums: false,
                functions: false,
                typedefs: false,
                variables: true,
            },
        ],
        "no-useless-assignment": "error",
        "no-useless-constructor": "error",
        "no-void": ["error", { allowAsStatement: true }],
        "object-shorthand": ["error", "always"],
        "prefer-template": "error",

        "oxc/no-async-await": "off",
        "oxc/no-optional-chaining": "off",
        "oxc/no-rest-spread-properties": "off",

        "unicorn/no-array-sort": "error",
        "unicorn/no-null": "off",
        "unicorn/no-useless-iterator-to-array": "error",
        "unicorn/prefer-ternary": "off",

        "import/export": "error",
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                json: "always",
                ts: "never",
                tsx: "never",
            },
        ],
        "import/exports-last": "error",
        "import/group-exports": "off",
        "import/named": "error",
        "import/newline-after-import": "error",
        "import/no-cycle": "error",
        "import/no-default-export": "error",
        "import/no-named-export": "off",
        "import/no-nodejs-modules": "off",
        "import/no-relative-parent-imports": "off",
        "import/no-unassigned-import": "error",
        "import/prefer-default-export": "off",
        "import/unambiguous": "off",

        "local/require-disable-directive-description": "error",

        "n/no-callback-literal": "error",
        "n/no-deprecated-api": "error",
        "n/no-extraneous-import": "error",

        "node/no-process-env": "error",
        "node/no-top-level-await": ["error", { ignoreBin: true }],

        "promise/no-return-in-finally": "error",

        // tsc's noImplicitReturns covers this and understands exhaustive switches
        "typescript/consistent-return": "off",
        "typescript/consistent-type-imports": [
            "error",
            {
                disallowTypeAnnotations: false,
                fixStyle: "separate-type-imports",
                prefer: "type-imports",
            },
        ],
        "typescript/explicit-member-accessibility": "error",
        "typescript/explicit-module-boundary-types": "error",
        "typescript/no-empty-object-type": "error",
        "typescript/no-explicit-any": ["error", { fixToUnknown: true, ignoreRestArgs: false }],
        "typescript/no-extraneous-class": "error",
        "typescript/no-magic-numbers": "off",
        "typescript/no-unnecessary-condition": "error",
        "typescript/no-unused-expressions": [
            "error",
            {
                allowShortCircuit: false,
                allowTaggedTemplates: false,
                allowTernary: false,
                enforceForJSX: false,
            },
        ],
        "no-unused-vars": [
            "error",
            {
                args: "all",
                argsIgnorePattern: "^_",
                caughtErrors: "all",
                ignoreRestSiblings: false,
                vars: "all",
            },
        ],
        "typescript/parameter-properties": "error",
        "typescript/prefer-optional-chain": "error",
        "typescript/prefer-readonly-parameter-types": "off",
        "typescript/promise-function-async": "error",
        "typescript/restrict-template-expressions": [
            "error",
            {
                allowAny: false,
                allowBoolean: false,
                allowNullish: false,
                allowNumber: true,
                allowRegExp: false,
            },
        ],
        "typescript/return-await": ["error", "in-try-catch"],
        "typescript/require-await": "off",
        "typescript/switch-exhaustiveness-check": [
            "error",
            {
                allowDefaultCaseForExhaustiveSwitch: false,
                considerDefaultExhaustiveForUnions: false,
                requireDefaultForNonUnion: true,
            },
        ],

        "perfectionist/sort-array-includes": "error",
        "perfectionist/sort-classes": "error",
        "perfectionist/sort-enums": "error",
        "perfectionist/sort-exports": "error",
        "perfectionist/sort-heritage-clauses": "error",
        "perfectionist/sort-interfaces": "error",
        "perfectionist/sort-intersection-types": "error",
        "perfectionist/sort-jsx-props": "error",
        "perfectionist/sort-maps": "error",
        "perfectionist/sort-named-exports": "error",
        "perfectionist/sort-named-imports": "error",
        "perfectionist/sort-object-types": "error",
        "perfectionist/sort-sets": "error",
        "perfectionist/sort-union-types": "error",
        "perfectionist/sort-variable-declarations": "error",
    },
    overrides: [
        {
            files: ["*.config.ts", "oxlint.plugin.ts"],
            rules: {
                "import/no-default-export": "off",
            },
        },
        {
            files: ["**/*.test.ts"],
            plugins: [...plugins, "vitest"],
            rules: {
                // the describe callback grows with the number of tests
                "max-lines-per-function": "off",
                "max-statements": "off",
                "vitest/no-hooks": "off",
                "vitest/no-importing-vitest-globals": "off",
                "vitest/prefer-expect-assertions": [
                    "error",
                    {
                        onlyFunctionsWithAsyncKeyword: true,
                        onlyFunctionsWithExpectInCallback: true,
                        onlyFunctionsWithExpectInLoop: true,
                    },
                ],
                "vitest/require-test-timeout": "error",
                "vitest/require-top-level-describe": "error",
            },
        },
        {
            files: ["**/test.setup.ts"],
            plugins: [...plugins, "vitest"],
            rules: {
                "vitest/no-hooks": "off",
                "vitest/no-importing-vitest-globals": "off",
            },
        },
    ],
});

export default config;
