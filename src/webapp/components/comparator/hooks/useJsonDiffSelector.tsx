import { useState, useEffect, useCallback, useMemo } from "react";
import { JSONArray, JSONContent, JSONValue } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import { parseJson } from "$/utils/jsonParser";
import {
    detectJsonDifferences,
    hasIdField,
    JsonDiff,
} from "$/webapp/components/comparator/hooks/utils/jsonUtils";

export const filterStatusList = ["all", "unhandled", "handled"] as const;

export type FilterStatus = (typeof filterStatusList)[number];

type JsonDiffSelectorState = {
    jsonDiffs: JsonDiff[];
    filteredDiffs: JsonDiff[];
    selectedChanges: Record<string, "left" | "right">;
    handledPaths: Set<string>;
    handledCount: number;
    totalCount: number;
    filterStatus: FilterStatus;
    setFilterStatus: (status: FilterStatus) => void;
    handleChangeSelection: (path: string, selection: "left" | "right") => void;
    getChangePreview: (diff: JsonDiff) => {
        leftPreview: string;
        rightPreview: string;
    };
};

type ParseState = { parts: string[]; current: string; inBracket: boolean };

const parsePath = (path: string): string[] => {
    const { parts, current } = Array.from(path).reduce<ParseState>(
        (state, char) => {
            if (char === "[") {
                return {
                    parts: state.current ? [...state.parts, state.current] : state.parts,
                    current: char,
                    inBracket: true,
                };
            }
            if (char === "]") {
                return {
                    parts: [...state.parts, state.current + char],
                    current: "",
                    inBracket: false,
                };
            }
            if (char === "." && !state.inBracket) {
                return {
                    parts: state.current ? [...state.parts, state.current] : state.parts,
                    current: "",
                    inBracket: state.inBracket,
                };
            }
            return { ...state, current: state.current + char };
        },
        { parts: [], current: "", inBracket: false }
    );
    return current ? [...parts, current] : parts;
};

const setNestedValue = (
    obj: JSONValue,
    pathParts: string[],
    value: Maybe<JSONValue>
): JSONValue => {
    if (pathParts.length === 0) return value as JSONContent | JSONArray;

    const [head, ...tail] = pathParts;
    if (!head) return obj;

    if (head.startsWith("[id:") && head.endsWith("]")) {
        const id = head.slice(4, -1);
        if (Array.isArray(obj)) {
            const index = obj.findIndex(
                (item: JSONValue) => hasIdField(item) && String(item.id) === id
            );

            if (index !== -1) {
                const newArray = [...obj];
                if (tail.length === 0) {
                    if (value !== undefined) {
                        newArray[index] = value;
                    }
                } else {
                    const currentItem = newArray[index];
                    if (JSONContent.isObject(currentItem) || JSONContent.isArray(currentItem)) {
                        const updatedItem = setNestedValue(currentItem, tail, value);
                        newArray[index] = updatedItem;
                    }
                }
                return newArray;
            } else if (tail.length === 0 && value !== undefined) {
                return [...obj, value];
            }
        }
        return obj;
    }

    if (JSONContent.isObject(obj)) {
        if (tail.length === 0) {
            return { ...obj, [head]: value } as JSONContent;
        }

        const nested = obj[head];

        if (!nested || (!JSONContent.isObject(nested) && !JSONContent.isArray(nested))) {
            const nextPart = tail[0];
            const shouldCreateArray = nextPart?.startsWith("[");
            const newNested = shouldCreateArray ? [] : {};

            return {
                ...obj,
                [head]: setNestedValue(newNested, tail, value),
            };
        }

        return {
            ...obj,
            [head]: setNestedValue(nested, tail, value),
        };
    }

    return obj;
};

const deleteNestedKey = (obj: JSONValue, pathParts: string[]): JSONValue => {
    if (pathParts.length === 0) return obj;

    const [head, ...tail] = pathParts;

    if (!head) return obj;

    if (head.startsWith("[id:") && head.endsWith("]")) {
        const id = head.slice(4, -1);
        if (Array.isArray(obj)) {
            if (tail.length === 0) {
                return obj.filter((item: JSONValue) => !hasIdField(item) || String(item.id) !== id);
            }

            return obj.map((item: JSONValue) => {
                if (hasIdField(item) && String(item.id) === id) {
                    if (JSONContent.isObject(item) || JSONContent.isArray(item)) {
                        return deleteNestedKey(item, tail);
                    }
                }
                return item;
            });
        }
        return obj;
    }

    if (JSONContent.isObject(obj)) {
        if (tail.length === 0) {
            const { [head]: _, ...rest } = obj;
            return rest;
        }

        const nested = obj[head];
        if (JSONContent.isObject(nested) || JSONContent.isArray(nested)) {
            return {
                ...obj,
                [head]: deleteNestedKey(nested, tail),
            };
        }
    }

    return obj;
};

export function useJsonDiffSelector(
    leftText: string,
    rightText: string,
    onMergedChange: (mergedJson: JSONValue) => void
): JsonDiffSelectorState {
    const [selectedChanges, setSelectedChanges] = useState<Record<string, "left" | "right">>({});
    const [handledPaths, setHandledPaths] = useState<Set<string>>(new Set());
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

    const jsonDiffs = useMemo(() => {
        if (!leftText || !rightText) return [];

        const leftJson = parseJson(leftText);
        const rightJson = parseJson(rightText);

        if (!leftJson || !rightJson) {
            console.error("Failed to parse JSON for diff detection");
            return [];
        }

        const differences = detectJsonDifferences(leftJson, rightJson);
        return [...differences].sort((a, b) => a.path.localeCompare(b.path));
    }, [leftText, rightText]);

    useEffect(() => {
        setSelectedChanges({});
        setHandledPaths(new Set());
        setFilterStatus("all");
    }, [jsonDiffs]);

    useEffect(() => {
        if (!leftText || jsonDiffs.length === 0) return;

        const leftJson = parseJson(leftText);
        if (!leftJson) return;

        const result: JSONValue = jsonDiffs.reduce<JSONValue>((acc, diff) => {
            const selection = selectedChanges[diff.path];
            const pathParts = parsePath(diff.path);

            if (selection === "right") {
                if (diff.type === "removed") {
                    const updated = deleteNestedKey(acc, pathParts);
                    return JSONContent.isObject(updated) || JSONContent.isArray(updated)
                        ? updated
                        : acc;
                } else {
                    const updated = setNestedValue(acc, pathParts, diff.rightValue);
                    return JSONContent.isObject(updated) || JSONContent.isArray(updated)
                        ? updated
                        : acc;
                }
            }

            if (diff.type === "added") {
                const updated = deleteNestedKey(acc, pathParts);
                return JSONContent.isObject(updated) || JSONContent.isArray(updated)
                    ? updated
                    : acc;
            } else {
                const updated = setNestedValue(acc, pathParts, diff.leftValue);
                return JSONContent.isObject(updated) || JSONContent.isArray(updated)
                    ? updated
                    : acc;
            }
        }, structuredClone(leftJson));

        onMergedChange(result);
    }, [selectedChanges, jsonDiffs, leftText, rightText, onMergedChange]);

    const handleChangeSelection = useCallback((path: string, selection: "left" | "right") => {
        setSelectedChanges(prev => ({ ...prev, [path]: selection }));
        setHandledPaths(prev => {
            const next = new Set(prev);
            next.add(path);
            return next;
        });
    }, []);

    const getChangePreview = useCallback((diff: JsonDiff) => {
        const formatValue = (value: Maybe<JSONValue>) =>
            value === undefined ? "N/A" : JSON.stringify(value).substring(0, 50);

        return {
            leftPreview: formatValue(diff.leftValue),
            rightPreview: formatValue(diff.rightValue),
        };
    }, []);

    const handledCount = handledPaths.size;
    const totalCount = jsonDiffs.length;

    const filteredDiffs = useMemo(() => {
        if (filterStatus === "all") return jsonDiffs;
        return jsonDiffs.filter(diff =>
            filterStatus === "handled" ? handledPaths.has(diff.path) : !handledPaths.has(diff.path)
        );
    }, [jsonDiffs, filterStatus, handledPaths]);

    return {
        jsonDiffs,
        filteredDiffs,
        selectedChanges,
        handledPaths,
        handledCount,
        totalCount,
        filterStatus,
        setFilterStatus,
        handleChangeSelection,
        getChangePreview,
    };
}
