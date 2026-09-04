import nodePath from "node:path";

import { codecovVitePlugin } from "@codecov/vite-plugin";
import type { SSROptions, UserConfig } from "vite";
import { loadEnv } from "vite";
import { checker } from "vite-plugin-checker";
import type { ViteUserConfigFn } from "vitest/config";
import { defineConfig } from "vitest/config";

function buildSsr(environment: Record<string, string>): SSROptions {
    const ssr: SSROptions = {
        target: "node",
    };

    if (environment["VITEST"] !== "true") {
        ssr.noExternal = true;
    }

    return ssr;
}
const configFunction: ViteUserConfigFn = defineConfig(({ mode }) => {
    const environment = loadEnv(mode, process.cwd(), "");

    const config: UserConfig = {
        appType: "custom",
        build: {
            lib: {
                entry: nodePath.resolve(import.meta.dirname, "src/index.ts"),
                fileName: "index",
                formats: ["es"],
            },
            minify: false,
            target: "node24",
            emptyOutDir: true,
            sourcemap: true,
            ssr: true,
            rolldownOptions: {
                treeshake: true,
                output: {
                    keepNames: true,
                },
            },
        },
        ssr: buildSsr(environment),
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
                reporter: ["json", "html", "text", "lcov"],
                provider: "v8",
                reportsDirectory: "reports",
            },
            environment: "node",
            environmentOptions: {
                // node: {},
            },
            globals: false,
            mockReset: true,
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
            unstubEnvs: true,
            unstubGlobals: true,
        },
    };

    return config;
});

export default configFunction;
