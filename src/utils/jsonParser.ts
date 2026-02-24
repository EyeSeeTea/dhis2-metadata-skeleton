import { JSONContent } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";

export const parseJson = (text: string): Maybe<JSONContent> => {
    try {
        return JSON.parse(text) as JSONContent;
    } catch {
        return undefined;
    }
};
