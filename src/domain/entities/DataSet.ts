import { BaseMetadata } from './common';

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
    sections: { id: string }[];
    legendSets: any[];
    dataInputPeriods: any[];
    indicators: any[];
    compulsoryDataElementOperands: any[];
    interpretations: any[];
    
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