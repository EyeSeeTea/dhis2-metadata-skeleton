import { BaseMetadata } from './common';

export interface Section extends BaseMetadata {
    dataElements: { id: string }[];
    indicators: any[];
    dataSet: {
        id: string;
    };
    sortOrder: number;
    showRowTotals: boolean;
    showColumnTotals: boolean;
}