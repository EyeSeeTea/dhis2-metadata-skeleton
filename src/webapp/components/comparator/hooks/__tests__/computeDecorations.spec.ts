import { describe, it, expect } from "vitest";
import { computeDecorations } from "$/webapp/components/comparator/hooks/useMergeHighlighting";
import { JsonDiff } from "$/webapp/components/comparator/hooks/utils/jsonUtils";

describe("computeDecorations", () => {
    const makeLineMap = (entries: Record<string, { startLine: number; endLine: number }>) => entries;

    it("should return empty array when no diffs have matching line ranges", () => {
        const diffs: JsonDiff[] = [
            { path: "missing.path", leftValue: 1, rightValue: 2, type: "modified" },
        ];
        const result = computeDecorations(diffs, {}, new Set(), undefined, { "missing.path": "left" });
        expect(result).toEqual([]);
    });

    it("should produce highlight-added class for added diffs", () => {
        const diffs: JsonDiff[] = [
            { path: "newField", leftValue: undefined, rightValue: "value", type: "added" },
        ];
        const lineMap = makeLineMap({ newField: { startLine: 3, endLine: 3 } });

        const result = computeDecorations(diffs, lineMap, new Set(), undefined, { newField: "left" });

        expect(result).toHaveLength(1);
        expect(result[0]?.options.className).toBe("highlight-added");
    });

    it("should produce highlight-removed class for removed diffs", () => {
        const diffs: JsonDiff[] = [
            { path: "oldField", leftValue: "value", rightValue: undefined, type: "removed" },
        ];
        const lineMap = makeLineMap({ oldField: { startLine: 5, endLine: 5 } });

        const result = computeDecorations(diffs, lineMap, new Set(), undefined, { oldField: "left" });

        expect(result).toHaveLength(1);
        expect(result[0]?.options.className).toBe("highlight-removed");
    });

    it("should produce highlight-modified class for modified diffs", () => {
        const diffs: JsonDiff[] = [
            { path: "name", leftValue: "old", rightValue: "new", type: "modified" },
        ];
        const lineMap = makeLineMap({ name: { startLine: 2, endLine: 2 } });

        const result = computeDecorations(diffs, lineMap, new Set(), undefined, { name: "left" });

        expect(result).toHaveLength(1);
        expect(result[0]?.options.className).toBe("highlight-modified");
    });

    it("should show glyph-warning for unhandled diffs", () => {
        const diffs: JsonDiff[] = [
            { path: "field", leftValue: 1, rightValue: 2, type: "modified" },
        ];
        const lineMap = makeLineMap({ field: { startLine: 2, endLine: 2 } });
        const handledPaths = new Set<string>(); // empty = unhandled

        const result = computeDecorations(diffs, lineMap, handledPaths, undefined, { field: "left" });

        expect(result[0]?.options.glyphMarginClassName).toBe("glyph-warning");
    });

    it("should show glyph-arrow-left for handled diff with left selection", () => {
        const diffs: JsonDiff[] = [
            { path: "field", leftValue: 1, rightValue: 2, type: "modified" },
        ];
        const lineMap = makeLineMap({ field: { startLine: 2, endLine: 2 } });
        const handledPaths = new Set(["field"]);

        const result = computeDecorations(diffs, lineMap, handledPaths, undefined, { field: "left" });

        expect(result[0]?.options.glyphMarginClassName).toBe("glyph-arrow-left");
    });

    it("should show glyph-arrow-right for handled diff with right selection", () => {
        const diffs: JsonDiff[] = [
            { path: "field", leftValue: 1, rightValue: 2, type: "modified" },
        ];
        const lineMap = makeLineMap({ field: { startLine: 2, endLine: 2 } });
        const handledPaths = new Set(["field"]);

        const result = computeDecorations(diffs, lineMap, handledPaths, undefined, { field: "right" });

        expect(result[0]?.options.glyphMarginClassName).toBe("glyph-arrow-right");
    });

    it("should add highlight-focused class when path is focused", () => {
        const diffs: JsonDiff[] = [
            { path: "field", leftValue: 1, rightValue: 2, type: "modified" },
        ];
        const lineMap = makeLineMap({ field: { startLine: 2, endLine: 2 } });

        const result = computeDecorations(diffs, lineMap, new Set(), "field", { field: "left" });

        expect(result[0]?.options.className).toBe("highlight-modified highlight-focused");
    });

    it("should not add highlight-focused class when a different path is focused", () => {
        const diffs: JsonDiff[] = [
            { path: "field", leftValue: 1, rightValue: 2, type: "modified" },
        ];
        const lineMap = makeLineMap({ field: { startLine: 2, endLine: 2 } });

        const result = computeDecorations(diffs, lineMap, new Set(), "other.path", { field: "left" });

        expect(result[0]?.options.className).toBe("highlight-modified");
    });

    it("should set correct line range in decoration", () => {
        const diffs: JsonDiff[] = [
            { path: "config", leftValue: {}, rightValue: { a: 1 }, type: "modified" },
        ];
        const lineMap = makeLineMap({ config: { startLine: 5, endLine: 10 } });

        const result = computeDecorations(diffs, lineMap, new Set(), undefined, { config: "left" });

        expect(result[0]?.range).toEqual({
            startLineNumber: 5,
            startColumn: 1,
            endLineNumber: 10,
            endColumn: 1,
        });
        expect(result[0]?.options.isWholeLine).toBe(true);
    });

    it("should produce decorations for multiple diffs", () => {
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
        const handledPaths = new Set(["name"]);

        const result = computeDecorations(diffs, lineMap, handledPaths, "age", {
            name: "right",
            age: "left",
            old: "left",
        });

        expect(result).toHaveLength(3);

        // name: modified, handled, right selection
        expect(result[0]?.options.className).toBe("highlight-modified");
        expect(result[0]?.options.glyphMarginClassName).toBe("glyph-arrow-right");

        // age: added, unhandled, focused
        expect(result[1]?.options.className).toBe("highlight-added highlight-focused");
        expect(result[1]?.options.glyphMarginClassName).toBe("glyph-warning");

        // old: removed, unhandled
        expect(result[2]?.options.className).toBe("highlight-removed");
        expect(result[2]?.options.glyphMarginClassName).toBe("glyph-warning");
    });

    it("should skip diffs with no matching line range", () => {
        const diffs: JsonDiff[] = [
            { path: "exists", leftValue: 1, rightValue: 2, type: "modified" },
            { path: "missing", leftValue: 3, rightValue: 4, type: "modified" },
        ];
        const lineMap = makeLineMap({ exists: { startLine: 2, endLine: 2 } });

        const result = computeDecorations(diffs, lineMap, new Set(), undefined, {
            exists: "left",
            missing: "left",
        });

        expect(result).toHaveLength(1);
        expect(result[0]?.range.startLineNumber).toBe(2);
    });
});
