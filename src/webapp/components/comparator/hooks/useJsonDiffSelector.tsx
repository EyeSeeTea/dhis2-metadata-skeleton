import { useState, useEffect, useCallback, useMemo } from "react";
import { JSONArray, JSONContent, JSONValue } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import { parseJson } from "$/utils/jsonParser";

type JsonDiff = {
    path: string;
    leftValue: Maybe<JSONValue>;
    rightValue: Maybe<JSONValue>;
    type: "added" | "removed" | "modified";
};

type JsonDiffSelectorState = {
    jsonDiffs: JsonDiff[];
    selectedChanges: Record<string, "left" | "right">;
    handleChangeSelection: (path: string, selection: "left" | "right") => void;
    getChangePreview: (diff: JsonDiff) => {
        leftPreview: string;
        rightPreview: string;
    };
};

const hasIdField = (value: JSONValue): value is { id: string | number } => {
    return JSONContent.isObject(value) && "id" in value;
};

const detectJsonDifferences = (
    left: Maybe<JSONValue>,
    right: Maybe<JSONValue>,
    path = ""
): JsonDiff[] => {
    if (!JSONContent.isValidJSON(left) && !JSONContent.isValidJSON(right)) return [];

    if (!JSONContent.isValidJSON(left)) {
        return [{ path, leftValue: left, rightValue: right, type: "added" }];
    }

    if (!JSONContent.isValidJSON(right)) {
        return [{ path, leftValue: left, rightValue: right, type: "removed" }];
    }

    if (JSONContent.isPrimitive(left) && JSONContent.isPrimitive(right)) {
        return left !== right
            ? [{ path, leftValue: left, rightValue: right, type: "modified" }]
            : [];
    }

    if (JSONContent.isPrimitive(left) || JSONContent.isPrimitive(right)) {
        return [{ path, leftValue: left, rightValue: right, type: "modified" }];
    }

    if (JSONContent.isArray(left) && JSONContent.isArray(right)) {
        const leftHasIds = left.length > 0 && left.every(hasIdField);
        const rightHasIds = right.length > 0 && right.every(hasIdField);

        if (leftHasIds && rightHasIds) {
            const leftById = new Map(left.map(item => [item.id, item]));
            const rightById = new Map(right.map(item => [item.id, item]));
            const allIds = [...new Set([...leftById.keys(), ...rightById.keys()])];

            return allIds.flatMap(id => {
                const currentPath = `${path}[id:${id}]`;
                const leftItem = leftById.get(id);
                const rightItem = rightById.get(id);

                if (!leftItem) {
                    return [
                        {
                            path: currentPath,
                            leftValue: undefined,
                            rightValue: rightItem,
                            type: "added" as const,
                        },
                    ];
                }

                if (!rightItem) {
                    return [
                        {
                            path: currentPath,
                            leftValue: leftItem,
                            rightValue: undefined,
                            type: "removed" as const,
                        },
                    ];
                }

                return detectJsonDifferences(leftItem, rightItem, currentPath);
            });
        }

        const maxLen = Math.max(left.length, right.length);
        return Array.from({ length: maxLen }, (_, i) => {
            const currentPath = `${path}[${i}]`;

            if (i >= left.length) {
                return [
                    {
                        path: currentPath,
                        leftValue: undefined,
                        rightValue: right[i],
                        type: "added" as const,
                    },
                ];
            }

            if (i >= right.length) {
                return [
                    {
                        path: currentPath,
                        leftValue: left[i],
                        rightValue: undefined,
                        type: "removed" as const,
                    },
                ];
            }

            return detectJsonDifferences(left[i], right[i], currentPath);
        }).flat();
    }

    if (JSONContent.isArray(left) !== JSONContent.isArray(right)) {
        return [{ path, leftValue: left, rightValue: right, type: "modified" }];
    }

    if (JSONContent.isObject(left) && JSONContent.isObject(right)) {
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        const allKeys = [...new Set([...leftKeys, ...rightKeys])];

        return allKeys.flatMap(key => {
            const currentPath = path ? `${path}.${key}` : key;
            const hasLeft = key in left;
            const hasRight = key in right;

            if (!hasLeft && hasRight) {
                return [
                    {
                        path: currentPath,
                        leftValue: undefined,
                        rightValue: right[key],
                        type: "added" as const,
                    },
                ];
            }

            if (hasLeft && !hasRight) {
                return [
                    {
                        path: currentPath,
                        leftValue: left[key],
                        rightValue: undefined,
                        type: "removed" as const,
                    },
                ];
            }

            return detectJsonDifferences(left[key], right[key], currentPath);
        });
    }

    return [];
};

const parsePath = (path: string): string[] => {
    const parts: string[] = [];
    let current = "";
    let inBracket = false;

    for (let i = 0; i < path.length; i++) {
        const char = path[i];

        if (char === "[") {
            if (current) {
                parts.push(current);
                current = "";
            }
            inBracket = true;
            current = char;
        } else if (char === "]") {
            current += char;
            parts.push(current);
            current = "";
            inBracket = false;
        } else if (char === "." && !inBracket) {
            if (current) {
                parts.push(current);
                current = "";
            }
        } else {
            current += char;
        }
    }

    if (current) {
        parts.push(current);
    }

    return parts;
};

const setNestedValue = (
    obj: JSONContent | JSONArray,
    pathParts: string[],
    value: Maybe<JSONValue>
): JSONContent | JSONArray => {
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
                        newArray[index] = setNestedValue(currentItem, tail, value);
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

const deleteNestedKey = (
    obj: JSONContent | JSONArray,
    pathParts: string[]
): JSONContent | JSONArray => {
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
    onMergedChange: (mergedJson: JSONContent) => void
): JsonDiffSelectorState {
    const [selectedChanges, setSelectedChanges] = useState<Record<string, "left" | "right">>({});

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
        const initial = jsonDiffs.reduce(
            (acc, diff) => ({ ...acc, [diff.path]: "left" as const }),
            {} as Record<string, "left" | "right">
        );
        setSelectedChanges(initial);
    }, [jsonDiffs]);

    useEffect(() => {
        if (!leftText || jsonDiffs.length === 0) return;

        const leftJson = parseJson(leftText);
        if (!leftJson) return;

        const result = jsonDiffs.reduce<JSONContent>((acc, diff) => {
            const selection = selectedChanges[diff.path];
            const pathParts = parsePath(diff.path);

            if (selection === "right") {
                if (diff.type === "removed") {
                    const updated = deleteNestedKey(acc, pathParts);
                    return JSONContent.isObject(updated) ? updated : acc;
                } else {
                    const updated = setNestedValue(acc, pathParts, diff.rightValue);
                    return JSONContent.isObject(updated) ? updated : acc;
                }
            }

            if (diff.type === "added") {
                const updated = deleteNestedKey(acc, pathParts);
                return JSONContent.isObject(updated) ? updated : acc;
            } else {
                const updated = setNestedValue(acc, pathParts, diff.leftValue);
                return JSONContent.isObject(updated) ? updated : acc;
            }
        }, structuredClone(leftJson));

        onMergedChange(result);
    }, [selectedChanges, jsonDiffs, leftText, rightText, onMergedChange]);

    const handleChangeSelection = useCallback((path: string, selection: "left" | "right") => {
        setSelectedChanges(prev => ({ ...prev, [path]: selection }));
    }, []);

    const getChangePreview = useCallback((diff: JsonDiff) => {
        const formatValue = (value: Maybe<JSONValue>) =>
            value === undefined ? "N/A" : JSON.stringify(value).substring(0, 50);

        return {
            leftPreview: formatValue(diff.leftValue),
            rightPreview: formatValue(diff.rightValue),
        };
    }, []);

    return {
        jsonDiffs,
        selectedChanges,
        handleChangeSelection,
        getChangePreview,
    };
}
