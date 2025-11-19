import * as jsondiffpatch from "jsondiffpatch";
import { JSONContent, JSONValue } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import _ from "$/domain/entities/generic/Collection";

export const sortJSONKeys = (value: JSONValue): JSONValue => {
    if (JSONContent.isArray(value)) {
        const sorted = _(value)
            .sortBy(value => (JSONContent.isObject(value) && "id" in value ? value.id : "~"))
            .value();

        return sorted.map(value => sortJSONKeys(value));
    }

    if (JSONContent.isObject(value)) {
        return Object.keys(value)
            .sort()
            .reduce((result, key) => {
                if (value[key]) result[key] = sortJSONKeys(value[key]);
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
