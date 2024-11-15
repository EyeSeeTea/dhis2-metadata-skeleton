import { FileRepository } from '../repository/FileRepository';
import { ProcessVisualization } from '../entities/ProcessVisualization';


export class VisualizationProcessor {
    constructor(private fileRepository: FileRepository) {}

    async process(): Promise<ProcessVisualization> {
        try {
            const files = await this.fileRepository.getJsonFiles();
            let processedData: ProcessVisualization = {
                dashboards: [],
                indicators: [],
                legendSets: [],
                visualizations: [],
                indicatorTypes: []
            };

            for (const file of files) {
                const parsedData = await this.fileRepository.readJsonFile(file);
                this.combineData(processedData, parsedData);
            }

            await this.fileRepository.writeProcessedData('3-visualizations.json', processedData);
            console.log(`Processed ${files.length} files successfully!`);
            return processedData;
        } catch (error) {
            console.error('Error processing programs:', error);
            throw error;
        }
    }

    private combineData(processedData: ProcessVisualization, parsedData: any): void {
        const addUniqueItems = (target: any[], source: any[]) => {
            source.forEach(item => {
                const exists = target.some(existing => existing.id === item.id);
                if (!exists) {
                    target.push(item);
                }
            });
        };
    
        if (Array.isArray(parsedData.indicators)) addUniqueItems(processedData.indicators, parsedData.indicators);
        if (Array.isArray(parsedData.legendSets)) addUniqueItems(processedData.legendSets, parsedData.legendSets);
        if (Array.isArray(parsedData.visualizations)) addUniqueItems(processedData.visualizations, parsedData.visualizations);
        if (Array.isArray(parsedData.indicatorTypes)) addUniqueItems(processedData.indicatorTypes, parsedData.indicatorTypes);
        if (Array.isArray(parsedData.dashboards)) addUniqueItems(processedData.dashboards, parsedData.dashboards);
    }
}