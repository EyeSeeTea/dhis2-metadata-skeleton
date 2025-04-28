import { ProcessedPrograms } from "../entities/ProcessProgram";
import { MetadataRepository } from "../repositories/MetadataRepository";
import { appendUnique } from "./helpers/appendUnique";

export class ProgramRemoveDuplicatesUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    async execute(): Promise<void> {
        try {
            const allMetadata = await this.metadataRepository.get();

            const allMetadataWithoutDuplicates = this.removeDuplicatesById(allMetadata);

            await this.metadataRepository.save(allMetadataWithoutDuplicates);
        } catch (error) {
            console.error("Error processing datasets:", error);
            throw error;
        }
    }

    private removeDuplicatesById(parsedData: any[]) {
        const initData: ProcessedPrograms = {
            dataElements: [],
            optionSets: [],
            options: [],
            programs: [],
            programStages: [],
            programRules: [],
            programRuleActions: [],
            programRuleVariables: [],
            programIndicators: [],
        };

        const processedData = parsedData.reduce((acc, data) => {
            return {
                ...acc,
                dataElements: appendUnique(acc.userGroups, data.userGroups),
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
        }, initData);

        console.log(`Processed files successfully!`);
        return processedData;
    }
}
