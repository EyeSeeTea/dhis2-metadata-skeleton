import { useCallback, useEffect, useMemo, useRef } from "react";
import type { OnMount } from "@monaco-editor/react";
import { JsonDiff } from "$/webapp/components/comparator/hooks/utils/jsonUtils";
import { buildPathToLineMap } from "$/webapp/components/comparator/hooks/utils/pathToLineMap";
import { Maybe } from "$/utils/ts-utils";
import "$/webapp/components/comparator/hooks/mergeHighlighting.css";

type MonacoEditor = Parameters<OnMount>[0];

type Decoration = {
    range: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
    };
    options: {
        isWholeLine: boolean;
        className: string;
        glyphMarginClassName: string;
    };
};

type UseMergeHighlightingProps = {
    mergedText: string;
    jsonDiffs: JsonDiff[];
    selectedChanges: Record<string, "left" | "right">;
    handledPaths: Set<string>;
    focusedPath: Maybe<string>;
};

type UseMergeHighlightingResult = {
    onEditorMount: OnMount;
    scrollToPath: (path: string) => void;
};

export function useMergeHighlighting(props: UseMergeHighlightingProps): UseMergeHighlightingResult {
    const { mergedText, jsonDiffs, selectedChanges, handledPaths, focusedPath } = props;

    const editorRef = useRef<MonacoEditor | null>(null);
    const decorationIdsRef = useRef<string[]>([]);
    const rafRef = useRef<number>(0);

    const diffPaths = useMemo(() => jsonDiffs.map(d => d.path), [jsonDiffs]);

    const pathToLineMap = useMemo(
        () => buildPathToLineMap(mergedText, diffPaths),
        [mergedText, diffPaths]
    );

    const decorations = useMemo(
        () => computeDecorations(jsonDiffs, pathToLineMap, handledPaths, focusedPath, selectedChanges),
        [jsonDiffs, pathToLineMap, handledPaths, focusedPath, selectedChanges]
    );

    useEffect(() => {
        const currentEditor = editorRef.current;
        if (!currentEditor) return;

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            decorationIdsRef.current = currentEditor.deltaDecorations(
                decorationIdsRef.current,
                decorations
            );
        });

        return () => cancelAnimationFrame(rafRef.current);
    }, [decorations, focusedPath]);

    const onEditorMount: OnMount = useCallback((editorInstance) => {
        editorRef.current = editorInstance;
        editorInstance.updateOptions({ glyphMargin: true });
    }, []);

    const scrollToPath = useCallback(
        (path: string) => {
            const currentEditor = editorRef.current;
            if (!currentEditor) return;

            const lineRange = pathToLineMap[path];
            if (lineRange) {
                currentEditor.revealLineInCenter(lineRange.startLine);
            }
        },
        [pathToLineMap]
    );

    return { onEditorMount, scrollToPath };
}

export function computeDecorations(
    jsonDiffs: JsonDiff[],
    pathToLineMap: Record<string, { startLine: number; endLine: number }>,
    handledPaths: Set<string>,
    focusedPath: Maybe<string>,
    selectedChanges: Record<string, "left" | "right">
): Decoration[] {
    if (!focusedPath) return [];

    const diff = jsonDiffs.find(d => d.path === focusedPath);
    if (!diff) return [];

    const lineRange = pathToLineMap[diff.path];
    if (!lineRange) return [];

    const isHandled = handledPaths.has(diff.path);
    const selection = selectedChanges[diff.path];

    const className = getHighlightClass(diff.type);

    const glyphClass = isHandled
        ? selection === "left"
            ? "glyph-arrow-left"
            : "glyph-arrow-right"
        : "glyph-warning";

    return [
        {
            range: {
                startLineNumber: lineRange.startLine,
                startColumn: 1,
                endLineNumber: lineRange.endLine,
                endColumn: 1,
            },
            options: {
                isWholeLine: true,
                className,
                glyphMarginClassName: glyphClass,
            },
        },
    ];
}

function getHighlightClass(type: JsonDiff["type"]): string {
    switch (type) {
        case "added":
            return "highlight-added";
        case "removed":
            return "highlight-removed";
        case "modified":
            return "highlight-modified";
    }
}
