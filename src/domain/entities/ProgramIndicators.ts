import { BaseMetadata } from "./common";

interface Access {
    delete: boolean;
    externalize: boolean;
    manage: boolean;
    read: boolean;
    update: boolean;
    write: boolean;
}

interface AnalyticsPeriodBoundary {
    access: Access;
    analyticsPeriodBoundaryType:
        | "AFTER_START_OF_REPORTING_PERIOD"
        | "BEFORE_END_OF_REPORTING_PERIOD";
    attributeValues: unknown[];
    boundaryTarget: string;
    created: string;
    favorite: boolean;
    favorites: unknown[];
    id: string;
    lastUpdated: string;
    sharing: {
        external: boolean;
        userGroups: Record<string, any>;
        users: Record<string, any>;
    };
    translations: unknown[];
}

interface ProgramReference {
    id: string;
}

export interface ProgramIndicator extends BaseMetadata {
    aggregationType: string;
    analyticsPeriodBoundaries: AnalyticsPeriodBoundary[];
    analyticsType: string;
    dimensionItem: string;
    dimensionItemType: string;
    displayFormName: string;
    expression: string;
    filter: string;
    legendSets: unknown[];
    program: ProgramReference;
    programIndicatorGroups: unknown[];
}
