import { useState, useEffect, useCallback, useMemo } from "react";
import { JSONContent, JSONValue } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";

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

const setNestedValue = (obj: any, pathParts: string[], value: Maybe<JSONValue>): any => {
    if (pathParts.length === 0) return value;

    const [head, ...tail] = pathParts;

    if (head) {
        if (head.startsWith("[id:") && head.endsWith("]")) {
            const id = head.slice(4, -1);
            if (Array.isArray(obj)) {
                const index = obj.findIndex(item => hasIdField(item) && String(item.id) === id);

                if (index !== -1) {
                    const newArray = [...obj];
                    if (tail.length === 0) {
                        newArray[index] = value;
                    } else {
                        newArray[index] = setNestedValue(newArray[index], tail, value);
                    }
                    return newArray;
                }
            }
        }

        if (tail.length === 0) {
            return { ...obj, [head]: value };
        }

        return {
            ...obj,
            [head]: setNestedValue(obj[head] || {}, tail, value),
        };
    }
};

const deleteNestedKey = (obj: any, pathParts: string[]): any => {
    if (pathParts.length === 0) return obj;

    const [head, ...tail] = pathParts;

    if (head) {
        if (head.startsWith("[id:") && head.endsWith("]")) {
            const id = head.slice(4, -1);
            if (Array.isArray(obj)) {
                if (tail.length === 0) {
                    return obj.filter(item => !hasIdField(item) || String(item.id) !== id);
                } else {
                    return obj.map(item => {
                        if (hasIdField(item) && String(item.id) === id) {
                            return deleteNestedKey(item, tail);
                        }
                        return item;
                    });
                }
            }
        }

        if (tail.length === 0) {
            const { [head]: _, ...rest } = obj;
            return rest;
        }

        return {
            ...obj,
            [head]: deleteNestedKey(obj[head] || {}, tail),
        };
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

        try {
            const leftJson = JSON.parse(leftText);
            const rightJson = JSON.parse(rightText);
            const differences = detectJsonDifferences(leftJson, rightJson);

            return [...differences].sort((a, b) => a.path.localeCompare(b.path));
        } catch (error) {
            console.error("Failed to parse JSON for diff detection:", error);
            return [];
        }
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

        try {
            const leftJson = JSON.parse(leftText);

            const result = jsonDiffs.reduce((acc, diff) => {
                const selection = selectedChanges[diff.path];
                const pathParts = parsePath(diff.path);

                if (selection === "right") {
                    return diff.type === "removed"
                        ? deleteNestedKey(acc, pathParts)
                        : setNestedValue(acc, pathParts, diff.rightValue);
                }

                return diff.type === "added"
                    ? deleteNestedKey(acc, pathParts)
                    : setNestedValue(acc, pathParts, diff.leftValue);
            }, JSON.parse(JSON.stringify(leftJson)));

            onMergedChange(result);
        } catch (error) {
            console.error("Failed to apply selected changes:", error);
        }
    }, [selectedChanges, jsonDiffs, leftText, onMergedChange]);

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
