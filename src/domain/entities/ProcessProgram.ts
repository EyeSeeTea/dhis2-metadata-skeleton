import { Program } from '../entities/Program';
import { ProgramStage } from '../entities/ProgramStage';
import { ProgramRule } from '../entities/ProgramRule';
import { ProgramRuleAction } from '../entities/ProgramRuleActions';
import { ProgramRuleVariable } from '../entities/ProgramRuleVariable';
import { ProgramIndicator } from '../entities/ProgramIndicators';
import { OptionSet } from '../entities/OptionSets';
import { Option } from '../entities/Option';
import { DataElement } from '../entities/DataElement';

export interface ProcessedPrograms {
    dataElements: DataElement[];
    optionSets: OptionSet[];
    options: Option[];
    programs: Program[];
    programStages: ProgramStage[];
    programRules: ProgramRule[];
    programRuleActions: ProgramRuleAction[];
    programRuleVariables: ProgramRuleVariable[];
    programIndicators: ProgramIndicator[];
}