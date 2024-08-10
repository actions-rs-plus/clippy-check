import type { AnnotationProperties } from "@actions/core";

export enum AnnotationLevel {
    Error,
    Warning,
    Notice,
}

export interface AnnotationWithMessageAndLevel {
    level: AnnotationLevel;
    message: string;
    properties: AnnotationProperties;
}

export interface MaybeCargoMessage {
    reason: string;
    message?: {
        code?: string | null;
        level: string;
        message: string;
        rendered: string;
        spans: DiagnosticSpan[];
    };
}

export interface CargoMessage {
    reason: "compiler-message";
    message: {
        code: string;
        level: string;
        message: string;
        rendered: string;
        spans: DiagnosticSpan[];
    };
}

export interface DiagnosticSpan {
    // biome-ignore lint/style/useNamingConvention: contract
    file_name: string;
    // biome-ignore lint/style/useNamingConvention: contract
    is_primary: boolean;
    // biome-ignore lint/style/useNamingConvention: contract
    line_start: number;
    // biome-ignore lint/style/useNamingConvention: contract
    line_end: number;
    // biome-ignore lint/style/useNamingConvention: contract
    column_start: number;
    // biome-ignore lint/style/useNamingConvention: contract
    column_end: number;
}

export interface Context {
    clippy: string;
    rustc: string;
    cargo: string;
}

export interface Stats {
    ice: number;
    error: number;
    warning: number;
    note: number;
    help: number;
}
