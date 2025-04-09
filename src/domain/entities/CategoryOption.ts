import { BaseMetadata } from "./common";

export interface CategoryOption extends BaseMetadata {
    startDate?: string;
    endDate?: string;
    organisationUnits: unknown[];
    access: {
        read: boolean;
        write: boolean;
        manage: boolean;
    };
}
