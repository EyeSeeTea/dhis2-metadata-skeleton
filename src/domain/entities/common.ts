

export interface NamedRef {
    id: string;
    code?: string;
    name: string;
    displayName: string;
    username?: string;
}

export interface Sharing {
    owner: string;
    external: boolean;
    users: Record<string, any>;
    userGroups: Record<string, {
        displayName: string;
        access: string;
        id: string;
    }>;
    public: string;
}

export interface BaseMetadata {
    id: string;
    code?: string;
    name: string;
    created: string;
    lastUpdated: string;
    shortName: string;
    description?: string;
    translations: any[];
    createdBy: NamedRef;
    lastUpdatedBy: NamedRef;
    favorites: any[];
    sharing: Sharing;
    displayName: string;
    displayShortName: string;
    displayDescription?: string;
    favorite: boolean;
    user: NamedRef;
    attributeValues: any[];
}