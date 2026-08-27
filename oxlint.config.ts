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
        "max-lines-per-function": "off",
        "max-params": ["error", { max: 4 }],
        "max-statements": "off",
        // typebox's builders are capitalised functions
        "new-cap": ["error", { capIsNewExceptionPattern: "^Type\\." }],
        "no-alert": "error",
        "no-console": "off",
        "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
        "no-inline-comments": "off",
        // tsc reports redeclarations (ts2451); this rule also flags a type and a value sharing a name, which TypeScript allows
        "no-redeclare": "off",
        "no-ternary": "off",
        "no-undefined": "off",
        "no-warning-comments": "off",
        "one-var": ["error", "never"],
        // destructuring a later array index needs a hole in the pattern (`const [, second] = ...`)
        "prefer-destructuring": ["error", { array: false, object: true }],
        "require-await": "off",
        "sort-imports": ["error", { ignoreDeclarationSort: true }],
        "sort-keys": "off",
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
        "no-useless-constructor": "error",
        "no-void": ["error", { allowAsStatement: true }],
        "object-shorthand": ["error", "always"],
        "prefer-template": "error",

        "oxc/no-async-await": "off",
        "oxc/no-optional-chaining": "off",
        "oxc/no-rest-spread-properties": "off",

        "unicorn/no-array-sort": "off",
        "unicorn/no-null": "off",
        "unicorn/prefer-ternary": "off",

        "import/extensions": [
            "error",
            "ignorePackages",
            {
                json: "always",
                ts: "never",
                tsx: "never",
            },
        ],
        "import/exports-last": "off",
        "import/group-exports": "off",
        "import/newline-after-import": "error",
        "import/no-cycle": "off",
        "import/no-default-export": "off",
        "import/no-named-export": "off",
        "import/no-nodejs-modules": "off",
        "import/no-relative-parent-imports": "off",
        "import/no-unassigned-import": "error",
        "import/prefer-default-export": "off",
        "import/unambiguous": "off",

        "local/require-disable-directive-description": "error",

        "n/no-callback-literal": "error",
        "n/no-deprecated-api": "error",
        "n/no-unpublished-import": "error",

        "node/no-process-env": "error",
        "node/no-top-level-await": ["error", { ignoreBin: true }],

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
        "typescript/promise-function-async": "off",
        "typescript/prefer-readonly-parameter-types": "off",
        "typescript/restrict-template-expressions": ["error", { allowNumber: true }],
        "typescript/return-await": ["error", "in-try-catch"],
        "typescript/require-await": "error",
        "typescript/switch-exhaustiveness-check": [
            "error",
            {
                allowDefaultCaseForExhaustiveSwitch: false,
                considerDefaultExhaustiveForUnions: false,
                requireDefaultForNonUnion: true,
            },
        ],

        "perfectionist/sort-classes": "error",
        "perfectionist/sort-interfaces": "error",
        "perfectionist/sort-intersection-types": "error",
        "perfectionist/sort-object-types": "error",
        "perfectionist/sort-union-types": "error",
    },
    overrides: [
        {
            files: ["**/*.test.ts"],
            plugins: [...plugins, "vitest"],
            rules: {
                "vitest/no-hooks": "off",
                "vitest/no-importing-vitest-globals": "off",
                "vitest/prefer-expect-assertions": ["error", { onlyFunctionsWithAsyncKeyword: true }],
                "vitest/require-test-timeout": "off",
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
