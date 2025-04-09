import { BaseMetadata } from "./common";

type Ref = { id: String };

export interface CategoryOptionCombo extends BaseMetadata {
    categoryCombo: {
        id: string;
    };
    categoryOptions: Ref[];
}
