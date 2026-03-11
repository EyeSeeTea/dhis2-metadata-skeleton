import { describe, it, expect } from "vitest";
import { buildPathToLineMap } from "$/webapp/components/comparator/hooks/utils/pathToLineMap";

function buildMapFromObj(obj: object, paths: string[]) {
    const text = JSON.stringify(obj, null, 2);
    return buildPathToLineMap(text, paths);
}

function expectRanges(
    result: Record<string, { startLine: number; endLine: number } | undefined>,
    expected: Record<string, { startLine: number; endLine: number }>
) {
    for (const [path, range] of Object.entries(expected)) {
        expect(result[path]).toEqual(range);
    }
}

describe("buildPathToLineMap", () => {
    describe("empty input", () => {
        it("should return empty object for empty text", () => {
            const result = buildPathToLineMap("", ["some.path"]);
            expect(result).toEqual({});
        });

        it("should return empty object for empty diff paths", () => {
            const result = buildMapFromObj({ name: "test" }, []);
            expect(result).toEqual({});
        });
    });

    describe("top-level keys", () => {
        it("should map a simple top-level key to its line", () => {
            const result = buildMapFromObj({ name: "John", age: 30 }, ["name"]);
            expect(result["name"]).toEqual({ startLine: 2, endLine: 2 });
        });

        it("should map multiple top-level keys", () => {
            const result = buildMapFromObj({ age: 30, name: "John" }, ["age", "name"]);
            expectRanges(result, {
                age: { startLine: 2, endLine: 2 },
                name: { startLine: 3, endLine: 3 },
            });
        });

        it("should handle boolean and null values", () => {
            const result = buildMapFromObj({ active: true, deleted: false, ref: null }, [
                "active",
                "deleted",
                "ref",
            ]);
            expectRanges(result, {
                active: { startLine: 2, endLine: 2 },
                deleted: { startLine: 3, endLine: 3 },
                ref: { startLine: 4, endLine: 4 },
            });
        });

        it("should handle string values with special characters", () => {
            const result = buildMapFromObj({ description: 'A "quoted" value' }, ["description"]);
            expect(result["description"]).toEqual({ startLine: 2, endLine: 2 });
        });
    });

    describe("nested objects", () => {
        it("should map nested object keys with dot notation", () => {
            const result = buildMapFromObj({ person: { age: 30, name: "John" } }, [
                "person.name",
                "person.age",
                "person",
            ]);
            expectRanges(result, {
                "person.name": { startLine: 4, endLine: 4 },
                "person.age": { startLine: 3, endLine: 3 },
                person: { startLine: 2, endLine: 5 },
            });
        });

        it("should handle deeply nested structures", () => {
            const DEEP_PATH = "categories[id:cat1].items[id:item1].name";
            const obj = {
                categories: [
                    {
                        id: "cat1",
                        items: [{ id: "item1", name: "Item 1" }],
                    },
                ],
            };
            const result = buildMapFromObj(obj, [DEEP_PATH]);
            expect(result[DEEP_PATH]).toBeDefined();
            expect(result[DEEP_PATH]?.startLine).toEqual(result[DEEP_PATH]?.endLine);
        });

        it("should handle multi-line nested objects as values", () => {
            const obj = {
                config: {
                    display: { color: "red", size: 12 },
                },
            };
            const result = buildMapFromObj(obj, ["config.display"]);
            const range = result["config.display"];
            expect(range).toBeDefined();
            expect(range?.startLine).toBeLessThan(range?.endLine ?? 0);
        });

        it("should handle empty arrays and objects as single-line values", () => {
            const result = buildMapFromObj({ emptyArr: [], emptyObj: {} }, [
                "emptyArr",
                "emptyObj",
            ]);
            expectRanges(result, {
                emptyArr: { startLine: 2, endLine: 2 },
                emptyObj: { startLine: 3, endLine: 3 },
            });
        });
    });

    describe("arrays", () => {
        it("should map array elements with id-based paths", () => {
            const obj = {
                items: [
                    { id: "abc", name: "First" },
                    { id: "def", name: "Second" },
                ],
            };
            const result = buildMapFromObj(obj, [
                "items[id:abc]",
                "items[id:abc].name",
                "items[id:def].name",
                "items",
            ]);
            expectRanges(result, {
                "items[id:abc]": { startLine: 3, endLine: 6 },
                "items[id:abc].name": { startLine: 5, endLine: 5 },
                "items[id:def].name": { startLine: 9, endLine: 9 },
                items: { startLine: 2, endLine: 11 },
            });
        });

        it("should map array elements without id using index-based paths", () => {
            const result = buildMapFromObj({ values: [10, 20, 30] }, [
                "values[0]",
                "values[1]",
                "values[2]",
            ]);
            expectRanges(result, {
                "values[0]": { startLine: 3, endLine: 3 },
                "values[1]": { startLine: 4, endLine: 4 },
                "values[2]": { startLine: 5, endLine: 5 },
            });
        });

        it("should handle top-level arrays with id-based items", () => {
            const obj = [
                { id: "a", value: 1 },
                { id: "b", value: 2 },
            ];
            const result = buildMapFromObj(obj, ["[id:a]", "[id:a].value", "[id:b].value"]);
            expectRanges(result, {
                "[id:a]": { startLine: 2, endLine: 5 },
                "[id:a].value": { startLine: 4, endLine: 4 },
                "[id:b].value": { startLine: 8, endLine: 8 },
            });
        });
    });

    describe("fallback", () => {
        it("should fallback to nearest parent when path is not found", () => {
            const result = buildMapFromObj({ person: { name: "John" } }, ["person.age"]);
            expect(result["person.age"]).toEqual({ startLine: 2, endLine: 4 });
        });

        it("should fallback to grandparent if parent is also not found", () => {
            const obj = { data: { nested: { value: 1 } } };
            const result = buildMapFromObj(obj, ["data.nested.missing.deep"]);
            const nestedResult = buildMapFromObj(obj, ["data.nested"]);
            expect(result["data.nested.missing.deep"]).toEqual(nestedResult["data.nested"]);
        });

        it("should handle id-based fallback for removed array elements", () => {
            const obj = { items: [{ id: "existing", name: "test" }] };
            const result = buildMapFromObj(obj, ["items[id:removed]"]);
            const itemsResult = buildMapFromObj(obj, ["items"]);
            expect(result["items[id:removed]"]).toEqual(itemsResult["items"]);
        });
    });

    describe("edge cases", () => {
        it("should return undefined for completely unresolvable paths", () => {
            const result = buildMapFromObj({ name: "test" }, ["nonexistent"]);
            expect(result["nonexistent"]).toBeUndefined();
        });
    });
});
