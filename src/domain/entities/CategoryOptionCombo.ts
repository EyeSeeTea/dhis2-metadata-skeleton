import { BaseMetadata} from './common';

export interface CategoryOptionCombo extends BaseMetadata {
    categoryCombo: {
        id: string;
    };
    categoryOptions: { id: string }[];
}