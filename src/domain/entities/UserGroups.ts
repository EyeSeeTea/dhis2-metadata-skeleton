import { BaseMetadata } from "./common";

export interface UserGroup
    extends Omit<BaseMetadata, "shortName" | "displayShortName" | "displayDescription"> {
    publicAccess: string;
    externalAccess: boolean;
    userGroupAccesses: unknown[];
    managedByGroups: unknown[];
    users: unknown[];
    managedGroups: unknown[];
    userAccesses: unknown[];
}
