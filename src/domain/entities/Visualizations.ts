import { BaseMetadata } from "./common";
import { Ref } from "./Ref";

interface VisualizationConfig {
    type: string;
    aggregationType?: string;
    measureCriteria?: string;
    regression?: boolean;
    targetLine?: boolean;
    baseLineValue?: number;
    sortOrder?: number;
    axes?: unknown[];
    series?: unknown[];
}

interface VisualizationDimension {
    id: string;
    dimension: string;
    items: Ref[];
}

export interface Visualization extends BaseMetadata {
    type: string;
    config: VisualizationConfig;
    dimensions: VisualizationDimension[];
    filters: unknown[];
    rows: unknown[];
    columns: unknown[];
    reportingParams?: {
        reportingPeriod: boolean;
        organisationUnit: boolean;
        parentOrganisationUnit: boolean;
        grandParentOrganisationUnit: boolean;
    };
}
