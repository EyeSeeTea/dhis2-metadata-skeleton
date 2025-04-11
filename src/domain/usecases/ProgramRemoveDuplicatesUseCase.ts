import { ProcessedPrograms } from "../entities/ProcessProgram";
import { MetadataRepository } from "../repositories/MetadataRepository";

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

    private removeDuplicatesById(allMetadata: any[]) {
        let processedData: ProcessedPrograms = {
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

        for (const metadata of allMetadata) {
            this.combineData(processedData, metadata);
        }

        console.log(`Processed files successfully!`);
        return processedData;
    }

    private combineData(processedData: ProcessedPrograms, parsedData: any): void {
        const addUniqueItems = (target: any[], source: any[]) => {
            source.forEach(item => {
                const exists = target.some(existing => existing.id === item.id);
                if (!exists) {
                    target.push(item);
                }
            });
        };

        if (Array.isArray(parsedData.dataElements))
            addUniqueItems(processedData.dataElements, parsedData.dataElements);
        if (Array.isArray(parsedData.optionSets))
            addUniqueItems(processedData.optionSets, parsedData.optionSets);
        if (Array.isArray(parsedData.options))
            addUniqueItems(processedData.options, parsedData.options);
        if (Array.isArray(parsedData.programs))
            addUniqueItems(processedData.programs, parsedData.programs);
        if (Array.isArray(parsedData.programStages))
            addUniqueItems(processedData.programStages, parsedData.programStages);
        if (Array.isArray(parsedData.programRules))
            addUniqueItems(processedData.programRules, parsedData.programRules);
        if (Array.isArray(parsedData.programRuleActions))
            addUniqueItems(processedData.programRuleActions, parsedData.programRuleActions);
        if (Array.isArray(parsedData.programRuleVariables))
            addUniqueItems(processedData.programRuleVariables, parsedData.programRuleVariables);
        if (Array.isArray(parsedData.programIndicators))
            addUniqueItems(processedData.programIndicators, parsedData.programIndicators);
    }
}
