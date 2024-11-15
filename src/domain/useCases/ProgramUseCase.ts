import { ProcessedPrograms } from '../entities/ProcessProgram';
import { FileRepository } from '../repository/FileRepository';

export class ProgramProcessor {
    constructor(private fileRepository: FileRepository) {}

    async process(): Promise<ProcessedPrograms> {
        try {
            const files = await this.fileRepository.getJsonFiles();
            let processedData: ProcessedPrograms = {
                dataElements: [],
                optionSets: [],
                options: [],
                programs: [],
                programStages: [],
                programRules: [],
                programRuleActions: [],
                programRuleVariables: [],
                programIndicators: []
            };

            for (const file of files) {
                const parsedData = await this.fileRepository.readJsonFile(file);
                this.combineData(processedData, parsedData);
            }

            await this.fileRepository.writeProcessedData('2-programs.json', processedData);
            console.log(`Processed ${files.length} files successfully!`);
            return processedData;
        } catch (error) {
            console.error('Error processing programs:', error);
            throw error;
        }
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
    
        if (Array.isArray(parsedData.dataElements)) addUniqueItems(processedData.dataElements, parsedData.dataElements);
        if (Array.isArray(parsedData.optionSets)) addUniqueItems(processedData.optionSets, parsedData.optionSets);
        if (Array.isArray(parsedData.options)) addUniqueItems(processedData.options, parsedData.options);
        if (Array.isArray(parsedData.programs)) addUniqueItems(processedData.programs, parsedData.programs);
        if (Array.isArray(parsedData.programStages)) addUniqueItems(processedData.programStages, parsedData.programStages);
        if (Array.isArray(parsedData.programRules)) addUniqueItems(processedData.programRules, parsedData.programRules);
        if (Array.isArray(parsedData.programRuleActions)) addUniqueItems(processedData.programRuleActions, parsedData.programRuleActions);
        if (Array.isArray(parsedData.programRuleVariables)) addUniqueItems(processedData.programRuleVariables, parsedData.programRuleVariables);
        if (Array.isArray(parsedData.programIndicators)) addUniqueItems(processedData.programIndicators, parsedData.programIndicators);
    }
}