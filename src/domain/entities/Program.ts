import { BaseMetadata } from "./common";

interface IdReference {
    id: string;
}

export interface Program extends BaseMetadata {
    accessLevel: 'OPEN' | string; // Add other access levels as needed
    completeEventsExpiryDays: number;
    displayFormName: string;
    displayFrontPageList: boolean;
    displayIncidentDate: boolean;
    expiryDays: number;
    ignoreOverdueEvents: boolean;
    maxTeiCountToReturn: number;
    minAttributesRequiredToSearch: number;
    notificationTemplates: any[];
    onlyEnrollOnce: boolean;
    openDaysAfterCoEndDate: number;
    
    // References to other entities
    programIndicators: IdReference[];
    programRuleVariables: IdReference[];
    programRules: IdReference[];
    programSections: any[];
    programStages: IdReference[];
    programTrackedEntityAttributes: any[];
    
    // Program specific properties
    programType: 'WITHOUT_REGISTRATION' | string; // Add other program types as needed
    registration: boolean;
    selectEnrollmentDatesInFuture: boolean;
    selectIncidentDatesInFuture: boolean;
    skipOffline: boolean;
    useFirstStageDuringRegistration: boolean;
    userRoles: any[];
    version: number;
    withoutRegistration: boolean;
}
