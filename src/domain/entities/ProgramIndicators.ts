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
    analyticsPeriodBoundaryType: "AFTER_START_OF_REPORTING_PERIOD" | "BEFORE_END_OF_REPORTING_PERIOD";
    attributeValues: any[];
    boundaryTarget: string;
    created: string;
    favorite: boolean;
    favorites: any[];
    id: string;
    lastUpdated: string;
    sharing: {
        external: boolean;
        userGroups: Record<string, any>;
        users: Record<string, any>;
    };
    translations: any[];
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
    legendSets: any[];
    program: ProgramReference;
    programIndicatorGroups: any[];
}
