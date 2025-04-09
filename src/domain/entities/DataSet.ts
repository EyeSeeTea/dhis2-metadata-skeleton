import { BaseMetadata } from "./common";
import { Ref } from "./Ref";

export interface DataSetElement {
    dataSet: {
        id: string;
    };
    dataElement: {
        id: string;
    };
}

export interface DataSet extends BaseMetadata {
    // Core properties
    periodType: string;
    dimensionItemType: string;
    formType: string;

    // Collections
    dataSetElements: DataSetElement[];
    sections: Ref[];
    legendSets: unknown[];
    dataInputPeriods: unknown[];
    indicators: unknown[];
    compulsoryDataElementOperands: unknown[];
    interpretations: unknown[];

    // Configuration flags
    mobile: boolean;
    version: number;
    expiryDays: number;
    timelyDays: number;
    notifyCompletingUser: boolean;
    openFuturePeriods: number;
    openPeriodsAfterCoEndDate: number;
    fieldCombinationRequired: boolean;
    validCompleteOnly: boolean;
    noValueRequiresComment: boolean;
    skipOffline: boolean;
    dataElementDecoration: boolean;
    renderAsTabs: boolean;
    renderHorizontally: boolean;
    compulsoryFieldsCompleteOnly: boolean;

    // Display properties
    dimensionItem: string;
    displayFormName: string;
}
