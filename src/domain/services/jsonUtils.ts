import * as jsondiffpatch from "jsondiffpatch";
import { JSONContent, JSONValue } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";

export const sortJSONKeys = (obj: JSONValue): JSONValue => {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(sortJSONKeys);

    return Object.keys(obj)
        .sort()
        .reduce((result: Record<string, JSONValue>, key: string) => {
            const value = obj[key];
            if (value) result[key] = sortJSONKeys(value);
            return result;
        }, {});
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
