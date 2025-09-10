import { describe, expect, it } from "vitest";
import { renderValue } from "$/webapp/components/comparator/ComparatorViewModel";

describe("renderValue", () => {
    const unit = "  ";

    it("renders primitive values", () => {
        const lines = renderValue({
            jsonValue: 42,
            path: "",
            depth: 0,
            isLast: true,
            unit,
        });

        expect(lines).toEqual([{ text: "42", path: "" }]);
    });

    it("renders arrays", () => {
        const lines = renderValue({
            jsonValue: [1, 2],
            path: "",
            depth: 0,
            isLast: true,
            unit,
        });

        expect(lines).toEqual([
            { text: "[", path: "" },
            { text: "  1,", path: "/0" },
            { text: "  2", path: "/1" },
            { text: "]", path: "" },
        ]);
    });

    it("renders objects", () => {
        const lines = renderValue({
            jsonValue: { a: 1 },
            path: "",
            depth: 0,
            isLast: true,
            unit,
        });

        expect(lines).toEqual([
            { text: "{", path: "" },
            { text: ' "a": 1', path: "/a" },
            { text: "}", path: "" },
        ]);
    });
});
