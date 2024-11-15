import { BaseMetadata } from "./common";

interface OptionReference {
    id: string;
}

export interface OptionSet extends BaseMetadata {
    valueType: string;
    version: number;
    options: OptionReference[];
}
