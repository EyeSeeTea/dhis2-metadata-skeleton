import { describe, it, expect } from "vitest";
import {
    sortJSONKeys,
    detectJsonDifferences,
    restoreOriginalOrder,
} from "$/webapp/components/comparator/hooks/utils/jsonUtils";
import { JSONArray, JSONContent, JSONValue } from "$/domain/entities/JSONContent";

describe("sortJSONKeys", () => {
    it("should sort object keys alphabetically", () => {
        const input = { z: 1, a: 2, m: 3 };
        const result = sortJSONKeys(input) as JSONContent;
        const keys = Object.keys(result);

        expect(keys).toEqual(["a", "m", "z"]);
    });

    it("should recursively sort nested object keys", () => {
        const input = {
            zebra: { z: 1, a: 2 },
            apple: { y: 3, b: 4 },
        };
        const result = sortJSONKeys(input) as JSONContent;

        expect(Object.keys(result)).toEqual(["apple", "zebra"]);
        expect(Object.keys(result.apple as JSONContent)).toEqual(["b", "y"]);
        expect(Object.keys(result.zebra as JSONContent)).toEqual(["a", "z"]);
    });

    it("should sort arrays with id field by id property", () => {
        const input = [
            { id: "3", name: "Third" },
            { id: "1", name: "First" },
            { id: "2", name: "Second" },
        ];
        const result = sortJSONKeys(input);
        const items = result as { id: string; name: string }[];

        expect(items[0]?.id).toBe("1");
        expect(items[1]?.id).toBe("2");
        expect(items[2]?.id).toBe("3");
    });

    it("should place items without id at the end when sorting arrays", () => {
        const input: JSONArray = [
            { id: "2", name: "Second" },
            { name: "NoId" },
            { id: "1", name: "First" },
        ];
        const result = sortJSONKeys(input) as JSONValue & { id?: string; name: string }[];

        expect(result[0]?.id).toBe("1");
        expect(result[1]?.id).toBe("2");
        expect(result[2]?.name).toBe("NoId");
    });

    it("should sort string IDs correctly", () => {
        const input = [
            { id: "30", name: "Third" },
            { id: "10", name: "First" },
            { id: "20", name: "Second" },
        ];
        const result = sortJSONKeys(input) as JSONValue & { id?: string; name: string }[];

        expect(result[0]?.id).toBe("10");
        expect(result[1]?.id).toBe("20");
        expect(result[2]?.id).toBe("30");
    });

    it("should recursively sort nested arrays", () => {
        const input = {
            categories: [
                {
                    id: "2",
                    items: [
                        { id: "b", name: "B" },
                        { id: "a", name: "A" },
                    ],
                },
                {
                    id: "1",
                    items: [
                        { id: "z", name: "Z" },
                        { id: "x", name: "X" },
                    ],
                },
            ],
        };
        const result = sortJSONKeys(input) as JSONContent;
        const categories = result.categories as (JSONValue & {
            id?: string;
            items?: (JSONValue & { id?: string; name?: string })[];
        })[];
        expect(categories[0]?.id).toBe("1");
        expect(categories[0]?.items?.[0]?.id).toBe("x");
        expect(categories[0]?.items?.[1]?.id).toBe("z");
    });
});

describe("detectJsonDifferences", () => {
    it("should detect no differences in identical objects", () => {
        const obj = { name: "John", age: 30 };
        const diffs = detectJsonDifferences(obj, obj);
        expect(diffs).toEqual([]);
    });

    it("should detect added property", () => {
        const left = { name: "John" };
        const right = { name: "John", age: 30 };
        const diffs = detectJsonDifferences(left, right);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
            path: "age",
            leftValue: undefined,
            rightValue: 30,
            type: "added",
        });
    });

    it("should detect removed property", () => {
        const left = { name: "John", age: 30 };
        const right = { name: "John" };
        const diffs = detectJsonDifferences(left, right);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
            path: "age",
            leftValue: 30,
            rightValue: undefined,
            type: "removed",
        });
    });

    it("should detect modified property", () => {
        const left = { name: "John", age: 30 };
        const right = { name: "John", age: 31 };
        const diffs = detectJsonDifferences(left, right);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
            path: "age",
            leftValue: 30,
            rightValue: 31,
            type: "modified",
        });
    });

    it("should detect nested property changes", () => {
        const left = { person: { name: "John", age: 30 } };
        const right = { person: { name: "John", age: 31 } };
        const diffs = detectJsonDifferences(left, right);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]?.path).toBe("person.age");
        expect(diffs[0]?.type).toBe("modified");
    });

    it("should detect changes in ID-based arrays", () => {
        const left = [
            { id: "1", name: "Item 1" },
            { id: "2", name: "Item 2" },
        ];
        const right = [
            { id: "1", name: "Item 1" },
            { id: "2", name: "Item 2 Updated" },
        ];
        const diffs = detectJsonDifferences(left, right);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
            path: "[id:2].name",
            leftValue: "Item 2",
            rightValue: "Item 2 Updated",
            type: "modified",
        });
    });

    it("should detect added item in ID-based array", () => {
        const left = [{ id: "1", name: "Item 1" }];
        const right = [
            { id: "1", name: "Item 1" },
            { id: "2", name: "Item 2" },
        ];
        const diffs = detectJsonDifferences(left, right);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
            path: "[id:2]",
            leftValue: undefined,
            rightValue: { id: "2", name: "Item 2" },
            type: "added",
        });
    });

    it("should detect removed item in ID-based array", () => {
        const left = [
            { id: "1", name: "Item 1" },
            { id: "2", name: "Item 2" },
        ];
        const right = [{ id: "1", name: "Item 1" }];
        const diffs = detectJsonDifferences(left, right);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
            path: "[id:2]",
            leftValue: { id: "2", name: "Item 2" },
            rightValue: undefined,
            type: "removed",
        });
    });

    it("should detect multiple changes in ID-based array", () => {
        const left = [
            { id: "1", name: "Item 1", status: "active" },
            { id: "2", name: "Item 2" },
        ];
        const right = [
            { id: "1", name: "Item 1", status: "inactive" },
            { id: "3", name: "Item 3" },
        ];
        const diffs = detectJsonDifferences(left, right);

        const statusDiff = diffs.find(d => d.path === "[id:1].status");
        const removedDiff = diffs.find(d => d.path === "[id:2]" && d.type === "removed");
        const addedDiff = diffs.find(d => d.path === "[id:3]" && d.type === "added");

        expect(statusDiff?.type).toBe("modified");
        expect(removedDiff).toBeDefined();
        expect(addedDiff).toBeDefined();
    });

    it("should handle non-ID arrays by index", () => {
        const left = [1, 2, 3];
        const right = [1, 5, 3];
        const diffs = detectJsonDifferences(left, right);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]).toEqual({
            path: "[1]",
            leftValue: 2,
            rightValue: 5,
            type: "modified",
        });
    });

    it("should detect primitive value changes", () => {
        const diffs = detectJsonDifferences(42, 43);
        expect(diffs).toHaveLength(1);
        expect(diffs[0]?.type).toBe("modified");
    });

    it("should handle type conversions", () => {
        const left = [1, 2, 3];
        const right = { 0: 1, 1: 2, 2: 3 };
        const diffs = detectJsonDifferences(left, right);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]?.type).toBe("modified");
    });

    it("should handle deeply nested arrays with IDs", () => {
        const left = {
            categories: [
                {
                    id: "cat1",
                    items: [
                        { id: "item1", name: "Item 1" },
                        { id: "item2", name: "Item 2" },
                    ],
                },
            ],
        };
        const right = {
            categories: [
                {
                    id: "cat1",
                    items: [
                        { id: "item1", name: "Item 1" },
                        { id: "item2", name: "Item 2 Updated" },
                    ],
                },
            ],
        };
        const diffs = detectJsonDifferences(left, right);

        expect(diffs).toHaveLength(1);
        expect(diffs[0]?.path).toContain("item2");
    });

    it("should return empty array when both are null/undefined", () => {
        const diffs = detectJsonDifferences(null, undefined);
        expect(diffs).toEqual([]);
    });

    it("should detect addition when left is null", () => {
        const diffs = detectJsonDifferences(null, { name: "John" });
        expect(diffs).toHaveLength(1);
        expect(diffs[0]?.type).toBe("added");
    });

    it("should detect removal when right is null", () => {
        const diffs = detectJsonDifferences({ name: "John" }, null);
        expect(diffs).toHaveLength(1);
        expect(diffs[0]?.type).toBe("removed");
    });
});

describe("restoreOriginalOrder", () => {
    it("should preserve order of items from left original", () => {
        const leftOriginal = [
            { id: "1", name: "First" },
            { id: "2", name: "Second" },
            { id: "3", name: "Third" },
        ];
        const rightOriginal = [
            { id: "3", name: "Third" },
            { id: "1", name: "First" },
            { id: "2", name: "Second" },
        ];
        const merged = [
            { id: "1", name: "First" },
            { id: "2", name: "Second" },
            { id: "3", name: "Third" },
        ];

        const result = restoreOriginalOrder(merged, leftOriginal, rightOriginal);
        const items = result as (JSONValue & { id?: string; name?: string })[];

        expect(items[0]?.id).toBe("1");
        expect(items[1]?.id).toBe("2");
        expect(items[2]?.id).toBe("3");
    });

    it("should handle new items from right original", () => {
        const leftOriginal = [
            { id: "1", name: "First" },
            { id: "2", name: "Second" },
        ];
        const rightOriginal = [
            { id: "1", name: "First" },
            { id: "3", name: "Third" },
        ];
        const merged = [
            { id: "1", name: "First" },
            { id: "2", name: "Second" },
            { id: "3", name: "Third" },
        ];

        const result = restoreOriginalOrder(merged, leftOriginal, rightOriginal);
        const items = result as (JSONValue & { id?: string; name?: string })[];

        expect(items[0]?.id).toBe("1");
        expect(items[1]?.id).toBe("2");
        expect(items[2]?.id).toBe("3");
    });

    it("should recursively restore order in nested arrays", () => {
        const leftOriginal = {
            categories: [
                {
                    id: "cat1",
                    items: [
                        { id: "item1", name: "Item 1" },
                        { id: "item2", name: "Item 2" },
                    ],
                },
            ],
        };
        const rightOriginal = {
            categories: [
                {
                    id: "cat1",
                    items: [
                        { id: "item2", name: "Item 2" },
                        { id: "item1", name: "Item 1" },
                    ],
                },
            ],
        };
        const merged = {
            categories: [
                {
                    id: "cat1",
                    items: [
                        { id: "item1", name: "Item 1" },
                        { id: "item2", name: "Item 2" },
                    ],
                },
            ],
        };

        const result = restoreOriginalOrder(merged, leftOriginal, rightOriginal) as JSONContent;
        const categories = result.categories as (JSONValue & {
            id?: string;
            items: (JSONValue & { id?: string; name?: string })[];
        })[];
        const items = categories[0]?.items as (JSONValue & { id?: string; name?: string })[];

        expect(items[0]?.id).toBe("item1");
        expect(items[1]?.id).toBe("item2");
    });

    it("should handle objects without arrays", () => {
        const leftOriginal = { name: "John", age: 30 };
        const rightOriginal = { name: "John", age: 31 };
        const merged = { name: "John", age: 30 };

        const result = restoreOriginalOrder(merged, leftOriginal, rightOriginal);

        expect(result).toEqual(merged);
    });

    it("should handle null or undefined originals", () => {
        const merged = [
            { id: "1", name: "First" },
            { id: "2", name: "Second" },
        ];

        const result = restoreOriginalOrder(merged, undefined, undefined);

        expect(Array.isArray(result)).toBe(true);
    });

    it("should preserve item properties while restoring order", () => {
        const leftOriginal = [
            { id: "1", name: "First", value: 100 },
            { id: "2", name: "Second", value: 200 },
        ];
        const rightOriginal = [
            { id: "2", name: "Second", value: 200 },
            { id: "1", name: "First", value: 100 },
        ];
        const merged = [
            { id: "1", name: "First Updated", value: 100 },
            { id: "2", name: "Second", value: 200 },
        ];

        const result = restoreOriginalOrder(merged, leftOriginal, rightOriginal);
        const items = result as { id: string; name: string; value: number }[];

        expect(items[0]?.id).toBe("1");
        expect(items[0]?.name).toBe("First Updated");
        expect(items[1]?.id).toBe("2");
    });

    it("should handle items without id field", () => {
        const leftOriginal = [{ name: "First" }, { name: "Second" }];
        const rightOriginal = [{ name: "Second" }, { name: "First" }];
        const merged = [{ name: "First" }, { name: "Second" }];

        const result = restoreOriginalOrder(merged, leftOriginal, rightOriginal);

        expect(Array.isArray(result)).toBe(true);
    });

    it("should handle left original with items not in merged", () => {
        const leftOriginal = [
            { id: "1", name: "First" },
            { id: "2", name: "Second" },
            { id: "3", name: "Third" },
        ];
        const rightOriginal = [{ id: "1", name: "First" }];
        const merged = [
            { id: "1", name: "First" },
            { id: "3", name: "Third" },
        ];

        const result = restoreOriginalOrder(merged, leftOriginal, rightOriginal);
        const items = result as { id: string }[];

        expect(items[0]?.id).toBe("1");
        expect(items[1]?.id).toBe("3");
    });
});
