import { BaseMetadata } from "./common";

interface DataElementReference {
    id: string;
}

interface ProgramRuleReference {
    id: string;
}

export interface ProgramRuleAction extends Omit<BaseMetadata, 
    'name' | 
    'displayName' | 
    'shortName' | 
    'displayShortName' | 
    'description' | 
    'displayDescription'
> {
    content: string;
    displayContent: string;
    dataElement: DataElementReference;
    programRule: ProgramRuleReference;
    programRuleActionType: 'SHOWERROR' | string; // Add other action types as needed
}
