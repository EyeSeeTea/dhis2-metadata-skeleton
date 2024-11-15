import { DataSet } from './DataSet';
import { DataElement } from './DataElement';
import { Category } from './Category';
import { CategoryOption } from './CategoryOption';
import { CategoryOptionCombo } from './CategoryOptionCombo';
import { LegendSet } from './LegendSet';
import { Section } from './Section';
import { CategoryCombos } from './CategoryCombos';
import { Program } from './Program';
import { ProgramStage } from './ProgramStage';
import { ProgramRule } from './ProgramRule';
import { ProgramRuleAction } from './ProgramRuleActions';
import { ProgramRuleVariable } from './ProgramRuleVariable';
import { ProgramIndicator } from './ProgramIndicators';
import { OptionSet } from './OptionSets';
import { Option } from './Option';

export interface ProcessedDataSet {
    dataSets: DataSet[];
    dataElements: DataElement[];
    categories: Category[];
    categoryOptions: CategoryOption[];
    categoryOptionCombos: CategoryOptionCombo[];
    legendSets: LegendSet[];
    sections: Section[];
    categoryCombos: CategoryCombos[];              
    optionSets: OptionSet[];
    options: Option[];  
    programs: Program[];
    programStages: ProgramStage[];
    programRules: ProgramRule[];
    programRuleActions: ProgramRuleAction[];
    programRuleVariables: ProgramRuleVariable[];
    programIndicators: ProgramIndicator[];
}