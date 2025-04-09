import { BaseMetadata } from "./common";

export interface Legend {
    name: string;
    created: string;
    lastUpdated: string;
    translations: unknown[];
    favorites: unknown[];
    sharing: {
        external: boolean;
        users: Record<string, any>;
        userGroups: Record<string, any>;
    };
    startValue: number;
    endValue: number;
    color: string;
    displayName: string;
    access: {
        manage: boolean;
        externalize: boolean;
        write: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
    };
    favorite: boolean;
    id: string;
    attributeValues: unknown[];
}

export interface LegendSet extends BaseMetadata {
    legends: Legend[];
}
