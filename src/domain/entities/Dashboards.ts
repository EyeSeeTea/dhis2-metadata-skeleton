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
    attributeValues: any[];
    reports: any[];
    resources: any[];
}

interface DashboardLayout {
    columns: any[];
}

interface DashboardItemConfig {
    insertPosition: string;
}

export interface Dashboard extends BaseMetadata {
    restrictFilters: boolean;
    allowedFilters: any[];
    itemCount: number;
    layout: DashboardLayout;
    itemConfig: DashboardItemConfig;
    dashboardItems: DashboardItem[];
}
