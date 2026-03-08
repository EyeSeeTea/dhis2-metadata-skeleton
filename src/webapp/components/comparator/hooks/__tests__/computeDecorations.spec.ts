import { describe, it, expect } from "vitest";
import { computeDecorations } from "$/webapp/components/comparator/hooks/useMergeHighlighting";
import { JsonDiff } from "$/webapp/components/comparator/hooks/utils/jsonUtils";

const GLYPH_WARNING = "glyph-warning";
const GLYPH_ARROW_LEFT = "glyph-arrow-left";
const GLYPH_ARROW_RIGHT = "glyph-arrow-right";
const HIGHLIGHT_ADDED = "highlight-added";
const HIGHLIGHT_REMOVED = "highlight-removed";
const HIGHLIGHT_MODIFIED = "highlight-modified";

const makeLineMap = (entries: Record<string, { startLine: number; endLine: number }>) => entries;

function runOneDiff(opts: {
    path?: string;
    type?: JsonDiff["type"];
    line?: number;
    endLine?: number;
    handledPaths?: string[];
    focusedPath?: string;
    selection?: "left" | "right";
}) {
    const path = opts.path ?? "field";
    const line = opts.line ?? 2;
    const endLine = opts.endLine ?? line;
    const diffs: JsonDiff[] = [
        { path, leftValue: 1, rightValue: 2, type: opts.type ?? "modified" },
    ];
    const lineMap = makeLineMap({ [path]: { startLine: line, endLine } });
    return computeDecorations(
        diffs,
        lineMap,
        new Set(opts.handledPaths ?? []),
        opts.focusedPath,
        opts.selection ? { [path]: opts.selection } : {}
    );
}

describe("computeDecorations", () => {
    describe("glyph class", () => {
        it("should show glyph-warning for unhandled diff", () => {
            const result = runOneDiff({});
            expect(result[0]?.options.glyphMarginClassName).toBe(GLYPH_WARNING);
        });

        it("should show glyph-arrow-left for handled diff with left selection", () => {
            const result = runOneDiff({ handledPaths: ["field"], selection: "left" });
            expect(result[0]?.options.glyphMarginClassName).toBe(GLYPH_ARROW_LEFT);
        });

        it("should show glyph-arrow-right for handled diff with right selection", () => {
            const result = runOneDiff({ handledPaths: ["field"], selection: "right" });
            expect(result[0]?.options.glyphMarginClassName).toBe(GLYPH_ARROW_RIGHT);
        });

        it("should return glyphs for all diffs even when focusedPath is undefined", () => {
            const result = runOneDiff({ selection: "left" });
            expect(result).toHaveLength(1);
            expect(result[0]?.options.className).toBe("");
            expect(result[0]?.options.glyphMarginClassName).toBe(GLYPH_WARNING);
        });

        it("should return glyphs without highlight when focusedPath does not match any diff", () => {
            const result = runOneDiff({ focusedPath: "other.path", selection: "left" });
            expect(result).toHaveLength(1);
            expect(result[0]?.options.className).toBe("");
            expect(result[0]?.options.glyphMarginClassName).toBe(GLYPH_WARNING);
        });
    });

    describe("highlight class by diff type", () => {
        it("added → highlight-added", () => {
            const result = runOneDiff({ path: "newField", type: "added", focusedPath: "newField", selection: "left" });
            expect(result[0]?.options.className).toBe(HIGHLIGHT_ADDED);
        });

        it("removed → highlight-removed", () => {
            const result = runOneDiff({ path: "oldField", type: "removed", focusedPath: "oldField", selection: "left" });
            expect(result[0]?.options.className).toBe(HIGHLIGHT_REMOVED);
        });

        it("modified → highlight-modified", () => {
            const result = runOneDiff({ path: "name", type: "modified", focusedPath: "name", selection: "left" });
            expect(result[0]?.options.className).toBe(HIGHLIGHT_MODIFIED);
        });
    });

    describe("edge cases", () => {
        it("should skip diffs with no matching line range", () => {
            const diffs: JsonDiff[] = [
                { path: "missing", leftValue: 1, rightValue: 2, type: "modified" },
            ];
            const result = computeDecorations(diffs, {}, new Set(), "missing", { missing: "left" });
            expect(result).toEqual([]);
        });

        it("should set correct line range in decoration", () => {
            const result = runOneDiff({ path: "config", line: 5, endLine: 10, focusedPath: "config", selection: "left" });
            expect(result[0]?.range).toEqual({
                startLineNumber: 5,
                startColumn: 1,
                endLineNumber: 10,
                endColumn: 1,
            });
            expect(result[0]?.options.isWholeLine).toBe(true);
        });
    });

    describe("multiple diffs", () => {
        it("should produce decorations for all diffs but only highlight the focused one", () => {
            const diffs: JsonDiff[] = [
                { path: "name", leftValue: "a", rightValue: "b", type: "modified" },
                { path: "age", leftValue: undefined, rightValue: 30, type: "added" },
                { path: "old", leftValue: "x", rightValue: undefined, type: "removed" },
            ];
            const lineMap = makeLineMap({
                name: { startLine: 2, endLine: 2 },
                age: { startLine: 3, endLine: 3 },
                old: { startLine: 4, endLine: 4 },
            });

            const result = computeDecorations(diffs, lineMap, new Set(), "age", {
                name: "right",
                age: "left",
                old: "left",
            });

            expect(result).toHaveLength(3);

            const focused = result.find(d => d.range.startLineNumber === 3);
            expect(focused?.options.className).toBe(HIGHLIGHT_ADDED);

            const unfocused = result.filter(d => d.range.startLineNumber !== 3);
            unfocused.forEach(d => expect(d.options.className).toBe(""));
        });
    });
});
