import { BaseMetadata } from "./common";
import { Ref } from "./Ref";

export interface Section extends BaseMetadata {
    dataElements: Ref[];
    indicators: unknown[];
    dataSet: {
        id: string;
    };
    sortOrder: number;
    showRowTotals: boolean;
    showColumnTotals: boolean;
}
