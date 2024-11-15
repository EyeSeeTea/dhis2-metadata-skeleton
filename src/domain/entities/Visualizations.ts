import { BaseMetadata } from "./common";

interface VisualizationConfig {
    type: string;
    aggregationType?: string;
    measureCriteria?: string;
    regression?: boolean;
    targetLine?: boolean;
    baseLineValue?: number;
    sortOrder?: number;
    axes?: any[];
    series?: any[];
}

interface VisualizationDimension {
    id: string;
    dimension: string;
    items: { id: string }[];
}

export interface Visualization extends BaseMetadata {
    type: string;
    config: VisualizationConfig;
    dimensions: VisualizationDimension[];
    filters: any[];
    rows: any[];
    columns: any[];
    reportingParams?: {
        reportingPeriod: boolean;
        organisationUnit: boolean;
        parentOrganisationUnit: boolean;
        grandParentOrganisationUnit: boolean;
    };
}

