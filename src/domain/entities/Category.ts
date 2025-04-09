import { BaseMetadata } from "./common";

type Ref = { id: String };

export interface Category extends BaseMetadata {
  dataDimensionType: string;
  dimensionType: string;
  categoryOptions: Ref[];
  dataDimension: boolean;
}
