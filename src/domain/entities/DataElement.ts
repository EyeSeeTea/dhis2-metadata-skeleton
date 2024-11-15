import { BaseMetadata } from './common';

export interface DataElement extends BaseMetadata {
    formName: string;
    dimensionItemType: string;
    legendSets: { id: string }[];
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
    aggregationLevels: any[];
    zeroIsSignificant: boolean;
    optionSetValue: boolean;
    dimensionItem: string;
    displayFormName: string;
    categoryCombo?: {
        id: string;
    };
    dataElementGroups: any[];
}