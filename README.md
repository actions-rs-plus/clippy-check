# Rust `clippy-check` Action

![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub Discussions](https://img.shields.io/github/discussions/actions-rs-plus/clippy-check)
![Build](https://img.shields.io/github/actions/workflow/status/actions-rs-plus/clippy-check/build.yml?branch=main)

> Clippy lints in your Pull Requests

This GitHub Action executes [`clippy`](https://github.com/rust-lang/rust-clippy)
and posts all lints as annotations for the pushed commit, as in the live example [here](https://github.com/actions-rs-plus/clippy-check-test/blob/292ad2e8d118959a973005b91615b46a774f95c1/.github/workflows/build.yml#L58-L61).

![Screenshot](./.github/screenshot.png)

## Example workflow

This example is utilizing [`toolchain`](https://github.com/actions-rs/toolchain) Actions
to install the most recent `nightly` clippy version.

```yaml
on: push
name: Clippy check
jobs:
    clippy_check:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4.2.2
            - uses: actions-rs/toolchain@v1
              with:
                  toolchain: nightly
                  components: clippy
                  override: true
            - uses: actions-rs-plus/clippy-check@v2.3.0
              with:
                  args: --all-features
```

### With stable clippy

```yaml
on: push
name: Clippy check
jobs:
    clippy_check:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4.2.2
            - run: rustup component add clippy
            - uses: actions-rs-plus/clippy-check@v2.3.0
              with:
                  args: --all-features
```

## Inputs

| Name                | Required | Description                                                                         | Type   | Default |
| ------------------- | :------: | ----------------------------------------------------------------------------------- | ------ | ------- |
| `toolchain`         |          | Rust toolchain to use; override or system default toolchain will be used if omitted | string |         |
| `args`              |          | Arguments for the `cargo clippy` command                                            | string |         |
| `use-cross`         |          | Use [`cross`](https://github.com/rust-embedded/cross) instead of `cargo`            | bool   | false   |
| `working-directory` |          | Specify where rust directory is                                                     | string | .       |

For extra details about the `toolchain`, `args` and `use-cross` inputs,
see [`cargo` Action](https://github.com/actions-rs/cargo#inputs) documentation.

## Limitations

The sky
