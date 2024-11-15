import { BaseMetadata } from './common';

export interface CategoryCombos extends BaseMetadata {
    categories: Array<{
        id: string;
    }>;
    dataDimensionType: string;
    skipTotal: boolean;
    categoryOptionCombos: Array<{
        id: string;
    }>;
    isDefault: boolean;
}