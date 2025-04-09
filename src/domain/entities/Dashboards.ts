import { BaseMetadata } from "./common";

interface DashboardItem {
    id: string;
    visualization?: {
        type: string;
        id: string;
    };
    x: number;
    y: number;
    height: number;
    width: number;
    type: string;
    interpretationCount: number;
    interpretationLikeCount: number;
    contentCount: number;
    favorite: boolean;
    attributeValues: unknown[];
    reports: unknown[];
    resources: unknown[];
}

interface DashboardLayout {
    columns: unknown[];
}

interface DashboardItemConfig {
    insertPosition: string;
}

export interface Dashboard extends BaseMetadata {
    restrictFilters: boolean;
    allowedFilters: unknown[];
    itemCount: number;
    layout: DashboardLayout;
    itemConfig: DashboardItemConfig;
    dashboardItems: DashboardItem[];
}
