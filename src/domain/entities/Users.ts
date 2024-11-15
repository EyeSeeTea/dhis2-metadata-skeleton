import { BaseMetadata } from "./common";

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
    cogsDimensionConstraints: any[];
    catDimensionConstraints: any[];
    previousPasswords: any[];
    lastLogin: string;
    selfRegistered: boolean;
    invitation: boolean;
    disabled: boolean;
    access: UserAccess;
    sharing: {
        external: boolean;
        users: Record<string, any>;
        userGroups: Record<string, any>;
    };
    userRoles: { id: string }[];
}

interface UserRef {
    id: string;
}

export interface User extends Omit<BaseMetadata, "shortName" | "displayShortName" | "displayDescription"> {
    username: string;
    externalAuth: boolean;
    passwordLastUpdated: string;
    cogsDimensionConstraints: any[];
    catDimensionConstraints: any[];
    lastLogin: string;
    selfRegistered: boolean;
    invitation: boolean;
    disabled: boolean;
    surname: string;
    firstName: string;
    email: string;
    organisationUnits: any[];
    dataViewOrganisationUnits: any[];
    teiSearchOrganisationUnits: any[];
    twoFactorEnabled: boolean;
    userCredentials: UserCredentials;
    userRoles: UserRef[];
    userGroups: UserRef[];
    userGroupAccesses: any[];
    userAccesses: any[];
}
