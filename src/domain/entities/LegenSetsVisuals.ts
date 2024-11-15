import { BaseMetadata } from "./common";

interface Legend {
    id: string;
    name: string;
    startValue: number;
    endValue: number;
    color: string;
}

export interface LegendSetVisuals extends BaseMetadata {
    legends: Legend[];
}

