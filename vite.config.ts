import nodeFs from "node:fs/promises";
import nodePath from "node:path";

import { codecovVitePlugin } from "@codecov/vite-plugin";
import type { Plugin, SSROptions, UserConfig } from "vite";
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

interface SourceMapLike {
    sourceRoot?: string;
    sources?: string[];
    sourcesContent?: Array<null | string>;
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await nodeFs.access(filePath);

        return true;
    } catch {
        return false;
    }
}

async function readSourceMap(mapPath: string): Promise<SourceMapLike | undefined> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- trusted input
        return JSON.parse(await nodeFs.readFile(mapPath, "utf8")) as SourceMapLike;
    } catch {
        return undefined;
    }
}

async function allSourcesExist(mapPath: string): Promise<boolean> {
    const map = await readSourceMap(mapPath);

    if (map === undefined) {
        return false;
    }

    const directory = nodePath.resolve(nodePath.dirname(mapPath), map.sourceRoot ?? "");

    const exists = await Promise.all(
        (map.sources ?? [])
            .filter((_source, index) => {
                return typeof map.sourcesContent?.[index] !== "string";
            })
            .map((source) => {
                return fileExists(nodePath.resolve(directory, source));
            }),
    );

    return exists.every(Boolean);
}

// @actions/* packages publish sourcemaps without the TypeScript sources they reference.
// Serving the files without the sourcemap reference stops Vite from warning about the missing sources when vitest inlines these packages.
function stripBrokenDependencySourcemaps(): Plugin {
    return {
        name: "strip-broken-dependency-sourcemaps",
        apply: "serve",
        load: {
            filter: {
                id: /node_modules\/@actions\/(?:core|exec|io)\/.*\.js$/v,
            },
            async handler(id) {
                const code = await nodeFs.readFile(id, "utf8");

                const url = /\/\/# sourceMappingURL=(?<url>\S+)\s*$/v.exec(code)?.groups?.["url"];

                if (url === undefined) {
                    return null;
                }

                if (await allSourcesExist(nodePath.resolve(nodePath.dirname(id), url))) {
                    return null;
                }

                return { code: code.replace(/\/\/# sourceMappingURL=\S+\s*$/v, "") };
            },
        },
    };
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
            stripBrokenDependencySourcemaps(),
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
