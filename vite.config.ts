import { codecovVitePlugin } from "@codecov/vite-plugin";
import type { UserConfig } from "vite";
import { checker } from "vite-plugin-checker";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

const deps: string[] = ["@actions-rs-plus/core"];

// https://vitejs.dev/config/
export default defineConfig(() => {
    const config: UserConfig = {
        appType: "custom",
        plugins: [
            checker({ typescript: true }),
            viteTsConfigPaths(),
            codecovVitePlugin({
                enableBundleAnalysis: process.env["CODECOV_TOKEN"] !== undefined,
                bundleName: "library",
                uploadToken: process.env["CODECOV_TOKEN"] ?? "",
            }),
        ],
        test: {
            coverage: {
                exclude: [...coverageConfigDefaults.exclude, "./dependency-cruiser.config.mjs"],
                reporter: ["json", "html", "text"],
                reportsDirectory: "coverage",
            },
            environment: "node",
            environmentOptions: {},
            outputFile: {
                junit: "./reports/test-report.xml",
            },
            server: {
                deps: {
                    inline: deps,
                },
            },
            restoreMocks: true,
            setupFiles: ["./test.setup.ts"],
        },
    };

    return config;
});
