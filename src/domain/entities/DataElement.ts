import { BaseMetadata } from "./common";
import { Ref } from "./Ref";

export interface DataElement extends BaseMetadata {
    formName: string;
    dimensionItemType: string;
    legendSets: Ref[];
    aggregationType: string;
    valueType: string;
    domainType: string;
    dataSetElements: {
        dataSet: {
            id: string;
        };
        dataElement: {
            id: string;
        };
    }[];
    aggregationLevels: unknown[];
    zeroIsSignificant: boolean;
    optionSetValue: boolean;
    dimensionItem: string;
    displayFormName: string;
    categoryCombo?: {
        id: string;
    };
    dataElementGroups: unknown[];
}
