import { BaseMetadata } from "./common";
import { Ref } from "./Ref";

interface UserAccess {
    manage: boolean;
    externalize: boolean;
    write: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}

interface UserCredentials {
    id: string;
    username: string;
    externalAuth: boolean;
    twoFA: boolean;
    passwordLastUpdated: string;
    cogsDimensionConstraints: unknown[];
    catDimensionConstraints: unknown[];
    previousPasswords: unknown[];
    lastLogin: string;
    selfRegistered: boolean;
    invitation: boolean;
    disabled: boolean;
    access: UserAccess;
    sharing: {
        external: boolean;
        users: Record<string, unknown>;
        userGroups: Record<string, unknown>;
    };
    userRoles: Ref[];
}

interface UserRef {
    id: string;
}

export interface User
    extends Omit<BaseMetadata, "shortName" | "displayShortName" | "displayDescription"> {
    username: string;
    externalAuth: boolean;
    passwordLastUpdated: string;
    cogsDimensionConstraints: unknown[];
    catDimensionConstraints: unknown[];
    lastLogin: string;
    selfRegistered: boolean;
    invitation: boolean;
    disabled: boolean;
    surname: string;
    firstName: string;
    email: string;
    organisationUnits: unknown[];
    dataViewOrganisationUnits: unknown[];
    teiSearchOrganisationUnits: unknown[];
    twoFactorEnabled: boolean;
    userCredentials: UserCredentials;
    userRoles: UserRef[];
    userGroups: UserRef[];
    userGroupAccesses: unknown[];
    userAccesses: unknown[];
}
