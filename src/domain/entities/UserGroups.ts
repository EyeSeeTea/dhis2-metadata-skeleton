import { BaseMetadata } from "./common";

export interface UserGroup extends Omit<BaseMetadata, "shortName" | "displayShortName" | "displayDescription"> {
    publicAccess: string;
    externalAccess: boolean;
    userGroupAccesses: any[];
    managedByGroups: any[];
    users: any[];
    managedGroups: any[];
    userAccesses: any[];
}