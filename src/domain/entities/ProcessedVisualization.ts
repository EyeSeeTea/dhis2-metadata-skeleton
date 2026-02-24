import { MetadataItem } from "$/domain/entities/common";

export type ProcessedVisualization = {
    dashboards: MetadataItem[];
    indicators: MetadataItem[];
    legendSets: MetadataItem[];
    visualizations: MetadataItem[];
    indicatorTypes: MetadataItem[];
};
