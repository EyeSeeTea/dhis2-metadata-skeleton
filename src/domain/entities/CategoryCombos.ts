import { BaseMetadata } from "./common";


export interface CategoryCombos extends BaseMetadata {
  categories: Array<{
    id: string;
  }>;
  dataDimensionType:"DISAGGREGATION" | "ATTRIBUTE";
  skipTotal: boolean;
  categoryOptionCombos: Array<{
    id: string;
  }>;
  isDefault: boolean;
}
