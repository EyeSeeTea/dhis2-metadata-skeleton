import { BaseMetadata } from './common';

export interface Category extends BaseMetadata {
    dataDimensionType: string;
    dimensionType: string;
    categoryOptions: { id: string }[];
    dataDimension: boolean;
}