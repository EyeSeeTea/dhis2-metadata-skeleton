import { MetadataItem } from "$/domain/entities/common";

export type ProcessedDataSetProgram = {
    dataSets: MetadataItem[];
    dataElements: MetadataItem[];
    categories: MetadataItem[];
    categoryOptions: MetadataItem[];
    categoryOptionCombos: MetadataItem[];
    legendSets: MetadataItem[];
    sections: MetadataItem[];
    categoryCombos: MetadataItem[];
    optionSets: MetadataItem[];
    options: MetadataItem[];
    programs: MetadataItem[];
    programStages: MetadataItem[];
    programRules: MetadataItem[];
    programRuleActions: MetadataItem[];
    programRuleVariables: MetadataItem[];
    programIndicators: MetadataItem[];
};
