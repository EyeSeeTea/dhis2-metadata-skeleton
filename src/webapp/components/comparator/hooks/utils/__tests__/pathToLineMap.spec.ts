import { describe, it, expect } from "vitest";
import { buildPathToLineMap } from "$/webapp/components/comparator/hooks/utils/pathToLineMap";

describe("buildPathToLineMap", () => {
    it("should return empty object for empty text", () => {
        const result = buildPathToLineMap("", ["some.path"]);
        expect(result).toEqual({});
    });

    it("should return empty object for empty diff paths", () => {
        const text = JSON.stringify({ name: "test" }, null, 2);
        const result = buildPathToLineMap(text, []);
        expect(result).toEqual({});
    });

    it("should map a simple top-level key to its line", () => {
        const obj = { name: "John", age: 30 };
        const text = JSON.stringify(obj, null, 2);
        // {
        //   "age": 30,
        //   "name": "John"
        // }
        // Note: JSON.stringify preserves insertion order

        const result = buildPathToLineMap(text, ["name"]);
        expect(result["name"]).toEqual({ startLine: 2, endLine: 2 });
    });

    it("should map multiple top-level keys", () => {
        const obj = { age: 30, name: "John" };
        const text = JSON.stringify(obj, null, 2);
        // Line 1: {
        // Line 2:   "age": 30,
        // Line 3:   "name": "John"
        // Line 4: }

        const result = buildPathToLineMap(text, ["age", "name"]);
        expect(result["age"]).toEqual({ startLine: 2, endLine: 2 });
        expect(result["name"]).toEqual({ startLine: 3, endLine: 3 });
    });

    it("should map nested object keys with dot notation", () => {
        const obj = { person: { age: 30, name: "John" } };
        const text = JSON.stringify(obj, null, 2);
        // Line 1: {
        // Line 2:   "person": {
        // Line 3:     "age": 30,
        // Line 4:     "name": "John"
        // Line 5:   }
        // Line 6: }

        const result = buildPathToLineMap(text, ["person.name", "person.age", "person"]);
        expect(result["person.name"]).toEqual({ startLine: 4, endLine: 4 });
        expect(result["person.age"]).toEqual({ startLine: 3, endLine: 3 });
        expect(result["person"]).toEqual({ startLine: 2, endLine: 5 });
    });

    it("should map array elements with id-based paths", () => {
        const obj = {
            items: [
                { id: "abc", name: "First" },
                { id: "def", name: "Second" },
            ],
        };
        const text = JSON.stringify(obj, null, 2);
        // Line 1:  {
        // Line 2:    "items": [
        // Line 3:      {
        // Line 4:        "id": "abc",
        // Line 5:        "name": "First"
        // Line 6:      },
        // Line 7:      {
        // Line 8:        "id": "def",
        // Line 9:        "name": "Second"
        // Line 10:     }
        // Line 11:   ]
        // Line 12: }

        const result = buildPathToLineMap(text, [
            "items[id:abc]",
            "items[id:abc].name",
            "items[id:def].name",
            "items",
        ]);

        expect(result["items[id:abc]"]).toEqual({ startLine: 3, endLine: 6 });
        expect(result["items[id:abc].name"]).toEqual({ startLine: 5, endLine: 5 });
        expect(result["items[id:def].name"]).toEqual({ startLine: 9, endLine: 9 });
        expect(result["items"]).toEqual({ startLine: 2, endLine: 11 });
    });

    it("should map array elements without id using index-based paths", () => {
        const obj = { values: [10, 20, 30] };
        const text = JSON.stringify(obj, null, 2);
        // Line 1: {
        // Line 2:   "values": [
        // Line 3:     10,
        // Line 4:     20,
        // Line 5:     30
        // Line 6:   ]
        // Line 7: }

        const result = buildPathToLineMap(text, ["values[0]", "values[1]", "values[2]"]);
        expect(result["values[0]"]).toEqual({ startLine: 3, endLine: 3 });
        expect(result["values[1]"]).toEqual({ startLine: 4, endLine: 4 });
        expect(result["values[2]"]).toEqual({ startLine: 5, endLine: 5 });
    });

    it("should handle deeply nested structures", () => {
        const obj = {
            categories: [
                {
                    id: "cat1",
                    items: [{ id: "item1", name: "Item 1" }],
                },
            ],
        };
        const text = JSON.stringify(obj, null, 2);

        const result = buildPathToLineMap(text, ["categories[id:cat1].items[id:item1].name"]);

        expect(result["categories[id:cat1].items[id:item1].name"]).toBeDefined();
        const range = result["categories[id:cat1].items[id:item1].name"];
        expect(range?.startLine).toEqual(range?.endLine); // single-line primitive
    });

    it("should fallback to nearest parent when path is not found", () => {
        const obj = { person: { name: "John" } };
        const text = JSON.stringify(obj, null, 2);
        // Line 1: {
        // Line 2:   "person": {
        // Line 3:     "name": "John"
        // Line 4:   }
        // Line 5: }

        // "person.age" doesn't exist, should fallback to "person"
        const result = buildPathToLineMap(text, ["person.age"]);
        expect(result["person.age"]).toEqual({ startLine: 2, endLine: 4 });
    });

    it("should fallback to grandparent if parent is also not found", () => {
        const obj = { data: { nested: { value: 1 } } };
        const text = JSON.stringify(obj, null, 2);

        // "data.nested.missing.deep" -> fallback to "data.nested"
        const result = buildPathToLineMap(text, ["data.nested.missing.deep"]);
        expect(result["data.nested.missing.deep"]).toBeDefined();
        // Should resolve to the "data.nested" range
        const nestedResult = buildPathToLineMap(text, ["data.nested"]);
        expect(result["data.nested.missing.deep"]).toEqual(nestedResult["data.nested"]);
    });

    it("should return undefined for completely unresolvable paths", () => {
        const obj = { name: "test" };
        const text = JSON.stringify(obj, null, 2);

        const result = buildPathToLineMap(text, ["nonexistent"]);
        expect(result["nonexistent"]).toBeUndefined();
    });

    it("should handle multi-line nested objects as values", () => {
        const obj = {
            config: {
                display: {
                    color: "red",
                    size: 12,
                },
            },
        };
        const text = JSON.stringify(obj, null, 2);

        const result = buildPathToLineMap(text, ["config.display"]);
        const range = result["config.display"];
        expect(range).toBeDefined();
        expect(range?.startLine).toBeLessThan(range?.endLine ?? 0);
    });

    it("should handle empty arrays and objects as single-line values", () => {
        const obj = { emptyArr: [], emptyObj: {} };
        const text = JSON.stringify(obj, null, 2);
        // Line 1: {
        // Line 2:   "emptyArr": [],
        // Line 3:   "emptyObj": {}
        // Line 4: }

        const result = buildPathToLineMap(text, ["emptyArr", "emptyObj"]);
        expect(result["emptyArr"]).toEqual({ startLine: 2, endLine: 2 });
        expect(result["emptyObj"]).toEqual({ startLine: 3, endLine: 3 });
    });

    it("should handle top-level arrays with id-based items", () => {
        const obj = [
            { id: "a", value: 1 },
            { id: "b", value: 2 },
        ];
        const text = JSON.stringify(obj, null, 2);
        // Line 1: [
        // Line 2:   {
        // Line 3:     "id": "a",
        // Line 4:     "value": 1
        // Line 5:   },
        // Line 6:   {
        // Line 7:     "id": "b",
        // Line 8:     "value": 2
        // Line 9:   }
        // Line 10: ]

        const result = buildPathToLineMap(text, ["[id:a]", "[id:a].value", "[id:b].value"]);
        expect(result["[id:a]"]).toEqual({ startLine: 2, endLine: 5 });
        expect(result["[id:a].value"]).toEqual({ startLine: 4, endLine: 4 });
        expect(result["[id:b].value"]).toEqual({ startLine: 8, endLine: 8 });
    });

    it("should handle id-based fallback for removed array elements", () => {
        // If items[id:removed] doesn't exist in the merged text,
        // it should fallback to "items"
        const obj = {
            items: [{ id: "existing", name: "test" }],
        };
        const text = JSON.stringify(obj, null, 2);

        const result = buildPathToLineMap(text, ["items[id:removed]"]);
        expect(result["items[id:removed]"]).toBeDefined();
        // Falls back to "items" range
        const itemsResult = buildPathToLineMap(text, ["items"]);
        expect(result["items[id:removed]"]).toEqual(itemsResult["items"]);
    });

    it("should handle boolean and null values", () => {
        const obj = { active: true, deleted: false, ref: null };
        const text = JSON.stringify(obj, null, 2);

        const result = buildPathToLineMap(text, ["active", "deleted", "ref"]);
        expect(result["active"]).toBeDefined();
        expect(result["deleted"]).toBeDefined();
        expect(result["ref"]).toBeDefined();
    });

    it("should handle string values with special characters", () => {
        const obj = { description: 'A "quoted" value' };
        const text = JSON.stringify(obj, null, 2);

        const result = buildPathToLineMap(text, ["description"]);
        expect(result["description"]).toBeDefined();
        expect(result["description"]?.startLine).toEqual(result["description"]?.endLine);
    });

    it("should use 1-based line numbers for Monaco compatibility", () => {
        const obj = { first: "a" };
        const text = JSON.stringify(obj, null, 2);
        // Line 1: {
        // Line 2:   "first": "a"
        // Line 3: }

        const result = buildPathToLineMap(text, ["first"]);
        expect(result["first"]?.startLine).toBeGreaterThanOrEqual(1);
    });
});
