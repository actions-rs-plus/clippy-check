import { builtinModules } from "node:module";
import nodePath from "node:path";

import { codecovVitePlugin } from "@codecov/vite-plugin";
import type { UserConfig } from "vite";
import { loadEnv } from "vite";
import { checker } from "vite-plugin-checker";
import viteTsConfigPaths from "vite-tsconfig-paths";

import { coverageConfigDefaults, defineConfig } from "vitest/config";

const externals = new Set(builtinModules);

export default defineConfig(({ mode }) => {
    const environment = loadEnv(mode, process.cwd(), "");

    const config: UserConfig = {
        appType: "custom",
        build: {
            lib: {
                entry: nodePath.resolve(import.meta.dirname, "src/index.ts"),
                formats: ["es"],
            },
            target: "node20",
            minify: true,
            emptyOutDir: true,
            sourcemap: true,
            rollupOptions: {
                external: (source: string): boolean => {
                    return externals.has(source) || source.startsWith("node:");
                },
            },
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
                bundleName: "core",
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
                provider: "v8",
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
            restoreMocks: true,
            setupFiles: ["./test.setup.ts"],
        },
    };

    return config;
});
