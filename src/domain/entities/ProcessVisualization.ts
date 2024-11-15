import { Dashboard } from "./Dashboards";
import { Indicator } from "./Indicators";
import { LegendSetVisuals } from "./LegenSetsVisuals";
import { Visualization } from "./Visualizations";
import { IndicatorType } from "./IndicatorType";

export interface ProcessVisualization {
    dashboards: Dashboard[];
    indicators: Indicator[];
    legendSets: LegendSetVisuals[];
    visualizations: Visualization[];
    indicatorTypes: IndicatorType[];
}