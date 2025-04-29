import { ProcessedDataSetProgram } from "../entities/ProcessedDataSetProgram";
import { MetadataRepository } from "../repositories/MetadataRepository";
import { appendUnique } from "./helpers/appendUnique";

export class DataSetProgramCombineAndRemoveDuplicatesUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    async execute(): Promise<void> {
        try {
            const metadataPackages = await this.metadataRepository.get<ProcessedDataSetProgram>();

            const metadataPackagesWithoutDuplicates =
                this.combineAndRemoveDuplicatesById(metadataPackages);

            await this.metadataRepository.save<ProcessedDataSetProgram>(metadataPackagesWithoutDuplicates);
        } catch (error) {
            console.error("Error processing datasets:", error);
            throw error;
        }
    }

    private combineAndRemoveDuplicatesById(metadataPackages: ProcessedDataSetProgram[]): ProcessedDataSetProgram {
        const initProcessedDataSet: ProcessedDataSetProgram = {
            dataSets: [],
            dataElements: [],
            categories: [],
            categoryOptions: [],
            categoryOptionCombos: [],
            legendSets: [],
            sections: [],
            categoryCombos: [],
            optionSets: [],
            options: [],
            programs: [],
            programStages: [],
            programRules: [],
            programRuleActions: [],
            programRuleVariables: [],
            programIndicators: [],
        };

        const processedDataSet = metadataPackages.reduce((acc, data) => {
            return {
                ...acc,
                dataSets: appendUnique(acc.dataSets, data.dataSets),
                dataElements: appendUnique(acc.dataElements, data.dataElements),
                categories: appendUnique(acc.categories, data.categories),
                categoryOptions: appendUnique(acc.categoryOptions, data.categoryOptions),
                categoryOptionCombos: appendUnique(
                    acc.categoryOptionCombos,
                    data.categoryOptionCombos
                ),
                legendSets: appendUnique(acc.legendSets, data.legendSets),
                sections: appendUnique(acc.sections, data.sections),
                categoryCombos: appendUnique(acc.categoryCombos, data.categoryCombos),
                optionSets: appendUnique(acc.optionSets, data.optionSets),
                options: appendUnique(acc.options, data.options),
                programs: appendUnique(acc.programs, data.programs),
                programStages: appendUnique(acc.programStages, data.programStages),
                programRules: appendUnique(acc.programRules, data.programRules),
                programRuleActions: appendUnique(acc.programRuleActions, data.programRuleActions),
                programRuleVariables: appendUnique(
                    acc.programRuleVariables,
                    data.programRuleVariables
                ),
                programIndicators: appendUnique(acc.programIndicators, data.programIndicators),
            };
        }, initProcessedDataSet);

        console.log(`Processed files successfully!`);
        return processedDataSet;
    }
}
