import { ProcessedDataSetProgram } from "../entities/ProcessedDataSetProgram";
import { MetadataRepository } from "../repositories/MetadataRepository";
import { concatUnique } from "./helpers/concatUnique";

export class DataSetProgramCombineAndRemoveDuplicatesUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    async execute(): Promise<void> {
        try {
            const metadataPackages = await this.metadataRepository.get<ProcessedDataSetProgram>();

            const metadataPackagesWithoutDuplicates =
                this.combineAndRemoveDuplicatesById(metadataPackages);

            await this.metadataRepository.save<ProcessedDataSetProgram>(
                metadataPackagesWithoutDuplicates
            );
        } catch (error) {
            console.error("Error processing datasets:", error);
            throw error;
        }
    }

    private combineAndRemoveDuplicatesById(
        metadataPackages: ProcessedDataSetProgram[]
    ): ProcessedDataSetProgram {
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
                dataSets: concatUnique(acc.dataSets, data.dataSets),
                dataElements: concatUnique(acc.dataElements, data.dataElements),
                categories: concatUnique(acc.categories, data.categories),
                categoryOptions: concatUnique(acc.categoryOptions, data.categoryOptions),
                categoryOptionCombos: concatUnique(
                    acc.categoryOptionCombos,
                    data.categoryOptionCombos
                ),
                legendSets: concatUnique(acc.legendSets, data.legendSets),
                sections: concatUnique(acc.sections, data.sections),
                categoryCombos: concatUnique(acc.categoryCombos, data.categoryCombos),
                optionSets: concatUnique(acc.optionSets, data.optionSets),
                options: concatUnique(acc.options, data.options),
                programs: concatUnique(acc.programs, data.programs),
                programStages: concatUnique(acc.programStages, data.programStages),
                programRules: concatUnique(acc.programRules, data.programRules),
                programRuleActions: concatUnique(acc.programRuleActions, data.programRuleActions),
                programRuleVariables: concatUnique(
                    acc.programRuleVariables,
                    data.programRuleVariables
                ),
                programIndicators: concatUnique(acc.programIndicators, data.programIndicators),
            };
        }, initProcessedDataSet);

        console.log(`Processed files successfully!`);
        return processedDataSet;
    }
}
