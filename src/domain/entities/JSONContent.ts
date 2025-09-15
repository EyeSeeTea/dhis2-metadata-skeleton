import { Maybe } from "$/utils/ts-utils";

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONContent | JSONArray;
export type JSONArray = JSONValue[];

export interface JSONContent {
    [key: string]: JSONValue;
}

export function isValidJSON(jsonContent: Maybe<JSONContent>): jsonContent is JSONContent {
    return jsonContent !== undefined && isJSONContent(jsonContent);
}

export function isJSONArray(jsonContent: Maybe<JSONValue>): jsonContent is JSONArray {
    return Array.isArray(jsonContent);
}

export function isJSONContent(jsonContent: Maybe<JSONValue>): jsonContent is JSONContent {
    return typeof jsonContent === "object" && jsonContent !== null && !Array.isArray(jsonContent);
}

export function isJSONPrimitive(jsonContent: Maybe<JSONValue>): jsonContent is JSONPrimitive {
    return jsonContent !== undefined && !isJSONArray(jsonContent) && !isJSONContent(jsonContent);
}

export const JSONContent = {
    isValidJSON: isValidJSON,
    isArray: isJSONArray,
    isObject: isJSONContent,
    isPrimitive: isJSONPrimitive,
};
