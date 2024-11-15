import { BaseMetadata } from "./common";

interface DataElementReference {
    id: string;
}

interface ProgramReference {
    id: string;
}

export interface ProgramRuleVariable extends Omit<BaseMetadata, 
    'shortName' | 
    'displayShortName' | 
    'description' | 
    'displayDescription'
> {
    dataElement: DataElementReference;
    program: ProgramReference;
    programRuleVariableSourceType: 'DATAELEMENT_CURRENT_EVENT' | string; // Add other source types as needed
    useCodeForOptionSet: boolean;
    valueType: string;
}
