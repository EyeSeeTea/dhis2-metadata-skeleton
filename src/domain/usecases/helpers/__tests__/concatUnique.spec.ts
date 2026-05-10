import { describe, expect, it } from "vitest";
import { concatUnique } from "../concatUnique";

describe("concatUnique", () => {
    it("returns the union of two arrays, deduplicated by id", () => {
        const a = [{ id: "a1" }, { id: "a2" }];
        const b = [{ id: "a2" }, { id: "b1" }];

        expect(concatUnique(a, b)).toEqual([{ id: "a1" }, { id: "a2" }, { id: "b1" }]);
    });

    it("preserves the first occurrence when the same id appears in both arrays", () => {
        const a = [{ id: "x", tag: "from-a" }] as const;
        const b = [{ id: "x", tag: "from-b" }] as const;

        expect(concatUnique(a, b)).toEqual([{ id: "x", tag: "from-a" }]);
    });

    it("treats an undefined first argument as an empty array", () => {
        // Regression: callers in the *CombineAndRemoveDuplicates use cases pass
        // `data.<key>` for a `<key>` that may be absent on the input file
        // (e.g. a tracker-only capture file has no `dataSets` key, so
        // `data.dataSets` is `undefined`). Before the fix, this crashed in
        // Collection.uniqBy with `Cannot read properties of undefined (reading 'id')`.
        expect(concatUnique<{ id: string }>(undefined, [{ id: "b1" }])).toEqual([{ id: "b1" }]);
    });

    it("treats an undefined second argument as an empty array", () => {
        expect(concatUnique<{ id: string }>([{ id: "a1" }], undefined)).toEqual([{ id: "a1" }]);
    });

    it("returns an empty array when both arguments are undefined", () => {
        expect(concatUnique<{ id: string }>(undefined, undefined)).toEqual([]);
    });

    it("returns an empty array when both arguments are empty", () => {
        expect(concatUnique<{ id: string }>([], [])).toEqual([]);
    });
});
