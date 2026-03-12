import nodePath from "node:path";

import { codecovVitePlugin } from "@codecov/vite-plugin";
import type { SSROptions, UserConfig } from "vite";
import { loadEnv } from "vite";
import { checker } from "vite-plugin-checker";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

function buildSsr(): SSROptions {
    const ssr: SSROptions = {
        target: "node",
    };

    if (process.env["VITEST"] !== "true") {
        ssr.noExternal = true;
    }

    return ssr;
}

export default defineConfig(({ mode }) => {
    const environment = loadEnv(mode, process.cwd(), "");

    const config: UserConfig = {
        appType: "custom",
        build: {
            lib: {
                entry: nodePath.resolve(import.meta.dirname, "src/index.ts"),
                fileName: "index",
                formats: ["es"],
            },
            target: "node24",
            minify: false,
            emptyOutDir: true,
            sourcemap: true,
            ssr: true,
            rollupOptions: {
                treeshake: true,
            },
        },
        ssr: buildSsr(),
        resolve: {
            tsconfigPaths: true,
        },
        plugins: [
            checker({ typescript: true }),
            codecovVitePlugin({
                enableBundleAnalysis: environment["GITHUB_ACTIONS"] === "true",
                bundleName: "clippy-check",
                oidc: {
                    useGitHubOIDC: true,
                },
                telemetry: false,
            }),
        ],
        test: {
            coverage: {
                exclude: [...coverageConfigDefaults.exclude, "./dependency-cruiser.config.mjs"],
                reporter: ["json", "html", "text", "lcov"],
                provider: "v8",
                reportsDirectory: "reports",
            },
            environment: "node",
            environmentOptions: {
                // node: {},
            },
            globals: false,
            outputFile: {
                junit: "./reports/results.xml",
            },
            restoreMocks: true,
            setupFiles: ["./test.setup.ts"],
            server: {
                deps: {
                    inline: ["@actions-rs-plus/core", "@actions/core", "@actions/exec", "@actions/io"],
                },
            },
        },
    };

    return config;
});
