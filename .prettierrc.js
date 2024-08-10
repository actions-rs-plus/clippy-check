module.exports = {
    arrowParens: "always",
    bracketSpacing: true,
    printWidth: 200,
    quoteProps: "as-needed",
    semi: true,
    singleQuote: false,
    useTabs: false,
    tabWidth: 4,
    trailingComma: "all",
    overrides: [
        {
            files: "*.js",
            options: {
                parser: "babel",
            },
        },
        {
            files: "*.json",
            options: {
                parser: "json",
            },
        },
        {
            files: "*.ts",
            options: {
                parser: "typescript",
            },
        },
        {
            files: ["*.yaml", "*.yml"],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
