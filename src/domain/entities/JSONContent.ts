import { Maybe } from "$/utils/ts-utils";

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONContent | JSONArray;
export type JSONArray = JSONValue[];

export class JSONContent {
    [key: string]: JSONValue;

    static isValidJSON(jsonContent: Maybe<JSONContent>): jsonContent is JSONContent {
        return jsonContent !== undefined && this.isObject(jsonContent);
    }

    static isArray(jsonContent: Maybe<JSONValue>): jsonContent is JSONArray {
        return Array.isArray(jsonContent);
    }

    static isObject(jsonContent: Maybe<JSONValue>): jsonContent is JSONContent {
        return (
            typeof jsonContent === "object" && jsonContent !== null && !Array.isArray(jsonContent)
        );
    }

    static isPrimitive(jsonContent: Maybe<JSONValue>): jsonContent is JSONPrimitive {
        return (
            jsonContent !== undefined && !this.isArray(jsonContent) && !this.isObject(jsonContent)
        );
    }
}
