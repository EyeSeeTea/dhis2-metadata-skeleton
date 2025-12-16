import * as jsondiffpatch from "jsondiffpatch";
import { JSONArray, JSONContent, JSONValue } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import _ from "$/domain/entities/generic/Collection";

function hasIdProperty(value: JSONValue): value is JSONContent & { id: string } {
    return JSONContent.isObject(value) && "id" in value;
}

export const sortJSONKeys = (value: JSONValue): JSONValue => {
    if (JSONContent.isArray(value)) {
        const sorted = _(value)
            .sortBy(value => (hasIdProperty(value) ? value.id : "~"))
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

export const formatJson = (json: Maybe<JSONContent>): string => {
    if (!json) return "";

    try {
        const sorted = sortJSONKeys(json);
        return JSON.stringify(sorted, null, 2);
    } catch {
        return "";
    }
};

export const parseJson = (text: string): Maybe<JSONContent> => {
    try {
        return JSON.parse(text) as JSONContent;
    } catch {
        return undefined;
    }
};

export const cloneJson = <T extends JSONContent | JSONValue>(obj: T): T => {
    return jsondiffpatch.clone(obj) as T;
};

export const restoreOriginalOrder = (
    value: JSONValue,
    leftOriginal: Maybe<JSONContent>,
    rightOriginal: Maybe<JSONContent>
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
                const itemId = hasIdProperty(item) ? item.id : undefined;
                const leftIndex = getIndexByItemId(itemId, leftArray);
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
                    item,
                    sortKey,
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

function getIndexByItemId(itemId: Maybe<string>, jsonObjects: JSONArray): number {
    return itemId
        ? jsonObjects.findIndex(right => JSONContent.isObject(right) && right.id === itemId)
        : -1;
}
