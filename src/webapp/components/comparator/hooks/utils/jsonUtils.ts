import * as jsondiffpatch from "jsondiffpatch";
import { JSONArray, JSONContent, JSONValue } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import _ from "$/domain/entities/generic/Collection";

export type JsonDiff = {
    path: string;
    leftValue: Maybe<JSONValue>;
    rightValue: Maybe<JSONValue>;
    type: "added" | "removed" | "modified";
};

export const hasIdField = (value: JSONValue): value is { id: string; [key: string]: JSONValue } => {
    return JSONContent.isObject(value) && "id" in value;
};

export const sortJSONKeys = (value: JSONValue): JSONValue => {
    if (JSONContent.isArray(value)) {
        const sorted = _(value)
            .sortBy(value => (hasIdField(value) ? value.id : "~"))
            .value();

        return sorted.map(value => sortJSONKeys(value));
    }

    if (JSONContent.isObject(value)) {
        return Object.keys(value)
            .sort()
            .reduce((result, key) => {
                const currentValue = value[key];
                if (currentValue) {
                    result[key] = sortJSONKeys(currentValue);
                }
                return result;
            }, {} as JSONContent);
    }

    return value;
};

export const formatJson = (json: Maybe<JSONValue>): string => {
    if (!json) return "";

    try {
        const sorted = sortJSONKeys(json);
        return JSON.stringify(sorted, null, 2);
    } catch {
        return "";
    }
};

export const cloneJson = <T extends JSONContent | JSONValue>(obj: T): T => {
    return jsondiffpatch.clone(obj) as T;
};

export const restoreOriginalOrder = (
    value: JSONValue,
    leftOriginal: Maybe<JSONValue>,
    rightOriginal: Maybe<JSONValue>
): JSONValue => {
    const restore = (
        val: JSONValue,
        leftRef: Maybe<JSONValue>,
        rightRef: Maybe<JSONValue>
    ): JSONValue => {
        if (JSONContent.isArray(val)) {
            const leftArray = JSONContent.isArray(leftRef) ? leftRef : [];
            const rightArray = JSONContent.isArray(rightRef) ? rightRef : [];

            const itemsWithMetadata = val.map(item => {
                const itemId = hasIdField(item) ? item.id : undefined;
                const leftIndex = getLeftIndex(itemId, leftArray, item);
                const rightIndex = getIndexByItemId(itemId, rightArray);

                const sortKey =
                    leftIndex !== -1
                        ? leftIndex
                        : rightIndex !== -1
                        ? leftArray.length + rightIndex
                        : Infinity;

                const itemLeftRef = leftIndex !== -1 ? leftArray[leftIndex] : undefined;
                const itemRightRef = rightIndex !== -1 ? rightArray[rightIndex] : undefined;

                return {
                    item: item,
                    sortKey: sortKey,
                    leftRef: itemLeftRef,
                    rightRef: itemRightRef,
                };
            });

            return _(itemsWithMetadata)
                .sortBy(x => x.sortKey)
                .map(({ item, leftRef, rightRef }) => restore(item, leftRef, rightRef))
                .value();
        }

        if (JSONContent.isObject(val)) {
            const leftObj = JSONContent.isObject(leftRef) ? leftRef : {};
            const rightObj = JSONContent.isObject(rightRef) ? rightRef : {};

            return Object.keys(val).reduce((result, key) => {
                const itemValue = val[key];
                if (itemValue) result[key] = restore(itemValue, leftObj[key], rightObj[key]);
                return result;
            }, {} as JSONContent);
        }

        return val;
    };

    return restore(value, leftOriginal, rightOriginal);
};

export const detectJsonDifferences = (
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

            const matchedByIdLeft = new Set<string>();
            const matchedByIdRight = new Set<string>();

            const results: JsonDiff[] = [];
            const allIds = [...new Set([...leftById.keys(), ...rightById.keys()])];

            for (const id of allIds) {
                const leftItem = leftById.get(id);
                const rightItem = rightById.get(id);

                if (leftItem && rightItem) {
                    matchedByIdLeft.add(id);
                    matchedByIdRight.add(id);
                    const currentPath = `${path}[id:${id}]`;
                    results.push(...detectJsonDifferences(leftItem, rightItem, currentPath));
                }
            }

            const unmatchedLeft = left.filter(item => !matchedByIdLeft.has(item.id));
            const unmatchedRight = Array.from(rightById.values()).filter(
                item => !matchedByIdRight.has(item.id)
            );

            const matchedPairs = new Set<string>();

            for (const leftItem of unmatchedLeft) {
                for (const rightItem of unmatchedRight) {
                    if (matchedPairs.has(`${leftItem.id}|${rightItem.id}`)) continue;

                    const leftKeys = Object.keys(leftItem)
                        .filter(k => k !== "id")
                        .sort();
                    const rightKeys = Object.keys(rightItem)
                        .filter(k => k !== "id")
                        .sort();

                    if (
                        leftKeys.length === rightKeys.length &&
                        leftKeys.every((k, idx) => k === rightKeys[idx])
                    ) {
                        const isSame = leftKeys.every(
                            key => JSON.stringify(leftItem[key]) === JSON.stringify(rightItem[key])
                        );

                        if (isSame) {
                            matchedPairs.add(`${leftItem.id}|${rightItem.id}`);
                            const currentPath = `${path}[id:${leftItem.id}]`;
                            results.push({
                                path: `${currentPath}.id`,
                                leftValue: leftItem.id,
                                rightValue: rightItem.id,
                                type: "modified" as const,
                            });
                            break;
                        }
                    }
                }
            }

            // Add remaining unmatched items
            for (const leftItem of unmatchedLeft) {
                const paired = Array.from(matchedPairs).some(pair =>
                    pair.startsWith(`${leftItem.id}|`)
                );
                if (!paired) {
                    const currentPath = `${path}[id:${leftItem.id}]`;
                    results.push({
                        path: currentPath,
                        leftValue: leftItem,
                        rightValue: undefined,
                        type: "removed" as const,
                    });
                }
            }

            for (const rightItem of unmatchedRight) {
                const paired = Array.from(matchedPairs).some(pair =>
                    pair.endsWith(`|${rightItem.id}`)
                );
                if (!paired) {
                    const currentPath = `${path}[id:${rightItem.id}]`;
                    results.push({
                        path: currentPath,
                        leftValue: undefined,
                        rightValue: rightItem,
                        type: "added" as const,
                    });
                }
            }

            return results;
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

function getLeftIndex(itemId: Maybe<string>, leftArray: JSONArray, item: JSONValue) {
    const itemIndex = getIndexByItemId(itemId, leftArray);
    const areItemsEqual = (
        leftItem: { [key: string]: JSONValue; id: string },
        item: { [key: string]: JSONValue; id: string }
    ): boolean => {
        const leftKeys = Object.keys(leftItem)
            .filter(k => k !== "id")
            .sort();
        const itemKeys = Object.keys(item)
            .filter(k => k !== "id")
            .sort();
        return (
            leftKeys.length === itemKeys.length &&
            leftKeys.every((k, idx) => k === itemKeys[idx]) &&
            leftKeys.every(k => JSON.stringify(leftItem[k]) === JSON.stringify(item[k]))
        );
    };

    return itemIndex !== -1
        ? itemIndex
        : hasIdField(item)
        ? leftArray.findIndex(leftItem => hasIdField(leftItem) && areItemsEqual(leftItem, item))
        : -1;
}

function getIndexByItemId(itemId: Maybe<string>, jsonObjects: JSONArray): number {
    return itemId
        ? jsonObjects.findIndex(right => JSONContent.isObject(right) && right.id === itemId)
        : -1;
}
