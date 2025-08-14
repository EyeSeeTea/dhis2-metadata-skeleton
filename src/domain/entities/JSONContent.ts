import { Maybe } from "$/utils/ts-utils";

export class JSONContent {
    [key: string]: unknown;

    constructor(data: Record<string, unknown>) {
        Object.assign(this, data);
    }

    static isValidJSON(jsonContent: Maybe<JSONContent>): boolean {
        return (
            jsonContent !== undefined ||
            Array.isArray(jsonContent) ||
            (typeof jsonContent === "object" && jsonContent !== null && !Array.isArray(jsonContent))
        );
    }
}
