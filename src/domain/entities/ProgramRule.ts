import { BaseMetadata } from "./common";

interface ProgramReference {
    id: string;
}

interface ProgramRuleActionReference {
    id: string;
}

export interface ProgramRule extends Omit<BaseMetadata, 
    'shortName' | 
    'displayShortName'
> {
    condition: string;
    program: ProgramReference;
    programRuleActions: ProgramRuleActionReference[];
}
