import { BaseMetadata } from "./common";

interface OptionSetReference {
    id: string;
}

export interface Option extends Omit<BaseMetadata, 'shortName' | 'displayShortName'> {
    displayFormName: string;
    optionSet: OptionSetReference;
    sortOrder: number;
}
