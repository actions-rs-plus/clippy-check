import type { AnnotationProperties } from "@actions/core";

export const AnnotationLevel = {
    Error: "error",
    Notice: "notice",
    Warning: "warning",
} as const;

export type AnnotationLevel = (typeof AnnotationLevel)[keyof typeof AnnotationLevel];

export interface AnnotationWithMessageAndLevel {
    level: AnnotationLevel;
    message: string;
    properties: AnnotationProperties;
}

export interface CargoMessage {
    message?: {
        code?: null | string;
        level: string;
        message: string;
        rendered: string;
        spans: DiagnosticSpan[];
    };
    reason: string;
}

export interface CompilerMessage extends CargoMessage {
    message: {
        code: string;
        level: string;
        message: string;
        rendered: string;
        spans: DiagnosticSpan[];
    };
    reason: "compiler-message";
}

export interface DiagnosticSpan {
    column_end: number;
    column_start: number;
    file_name: string;
    is_primary: boolean;
    line_end: number;
    line_start: number;
}

export interface Context {
    cargo: string;
    clippy: string;
    rustc: string;
}

export interface Stats {
    error: number;
    help: number;
    ice: number;
    note: number;
    warning: number;
}
