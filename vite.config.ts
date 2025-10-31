import nodePath from "node:path";

import { codecovVitePlugin } from "@codecov/vite-plugin";
import type { UserConfig } from "vite";
import { loadEnv } from "vite";
import { checker } from "vite-plugin-checker";
import viteTsConfigPaths from "vite-tsconfig-paths";

import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
    const environment = loadEnv(mode, process.cwd(), "");

    const depsToInlineDuringTest: string[] = ["@actions-rs-plus/core"];

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
                treeshake: "smallest",
            },
        },
        ssr: {
            noExternal: true,
            target: "node",
        },
        resolve: {
            alias: {
                "@/": nodePath.resolve(import.meta.dirname, "src/"),
            },
        },
        plugins: [
            checker({ typescript: true }),
            viteTsConfigPaths(),
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
                reporter: ["json", "html", "text"],
                provider: "istanbul",
                reportsDirectory: "coverage",
            },
            environment: "node",
            environmentOptions: {
                // node: {},
            },
            globals: false,
            outputFile: {
                junit: "./reports/test-report.xml",
            },
            server: {
                deps: {
                    inline: depsToInlineDuringTest,
                },
            },
            restoreMocks: true,
            setupFiles: ["./test.setup.ts"],
        },
    };

    return config;
});
