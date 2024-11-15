import { BaseMetadata } from "./common";

interface LegendSetRef {
    id: string;
}

interface IndicatorTypeRef {
    id: string;
}

export interface Indicator extends BaseMetadata {
    dimensionItemType: string;
    legendSets: LegendSetRef[];
    annualized: boolean;
    decimals: number;
    indicatorType: IndicatorTypeRef;
    numerator: string;
    numeratorDescription: string;
    denominator: string;
    denominatorDescription: string;
    displayNumeratorDescription: string;
    displayDenominatorDescription: string;
    dimensionItem: string;
    legendSet?: LegendSetRef;
    indicatorGroups: any[];
}

