import { Maybe } from "$/utils/ts-utils";

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONContent | JSONArray;
export type JSONArray = JSONValue[];

export interface JSONContent {
    [key: string]: JSONValue;
}

export const isValidJSON = (jsonContent: Maybe<JSONValue>): jsonContent is JSONValue => {
    return jsonContent !== undefined && jsonContent !== null;
};

export const isJSONArray = (jsonContent: Maybe<JSONValue>): jsonContent is JSONArray => {
    return Array.isArray(jsonContent);
};

export const isJSONContent = (jsonContent: Maybe<JSONValue>): jsonContent is JSONContent => {
    return typeof jsonContent === "object" && jsonContent !== null && !Array.isArray(jsonContent);
};

export const isJSONPrimitive = (jsonContent: Maybe<JSONValue>): jsonContent is JSONPrimitive => {
    return (
        jsonContent === null ||
        typeof jsonContent === "string" ||
        typeof jsonContent === "number" ||
        typeof jsonContent === "boolean"
    );
};

export const JSONContent = {
    isValidJSON,
    isArray: isJSONArray,
    isObject: isJSONContent,
    isPrimitive: isJSONPrimitive,
} as const;
