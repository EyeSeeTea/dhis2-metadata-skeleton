import { BaseMetadata } from "./common";

interface Access {
    delete: boolean;
    externalize: boolean;
    manage: boolean;
    read: boolean;
    update: boolean;
    write: boolean;
}

interface RenderType {
    DESKTOP: {
        type: string;
    };
    MOBILE: {
        type: string;
    };
}

interface DataElementReference {
    id: string;
}

interface ProgramStageReference {
    id: string;
}

interface ProgramReference {
    id: string;
}

interface ProgramStageDataElement {
    access: Access;
    allowFutureDate: boolean;
    allowProvidedElsewhere: boolean;
    attributeValues: any[];
    compulsory: boolean;
    created: string;
    dataElement: DataElementReference;
    displayInReports: boolean;
    favorite: boolean;
    favorites: any[];
    id: string;
    lastUpdated: string;
    programStage: ProgramStageReference;
    renderOptionsAsRadio: boolean;
    renderType?: RenderType;
    sharing: {
        external: boolean;
        userGroups: Record<string, any>;
        users: Record<string, any>;
    };
    skipAnalytics: boolean;
    skipSynchronization: boolean;
    sortOrder: number;
    translations: any[];
}

export interface ProgramStage extends BaseMetadata {
    allowGenerateNextVisit: boolean;
    autoGenerateEvent: boolean;
    blockEntryForm: boolean;
    displayExecutionDateLabel: string;
    displayGenerateEventBox: boolean;
    enableUserAssignment: boolean;
    executionDateLabel: string;
    formType: string;
    generatedByEnrollmentDate: boolean;
    hideDueDate: boolean;
    minDaysFromStart: number;
    notificationTemplates: any[];
    openAfterEnrollment: boolean;
    preGenerateUID: boolean;
    program: ProgramReference;
    programStageDataElements: ProgramStageDataElement[];
    programStageSections: any[];
    referral: boolean;
    remindCompleted: boolean;
    repeatable: boolean;
    validationStrategy: string;
}

