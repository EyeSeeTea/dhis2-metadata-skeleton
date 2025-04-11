import { ProcessVisualization } from "../entities/ProcessVisualization";
import { MetadataRepository } from "../repositories/MetadataRepository";

export class VisualizationRemoveDuplicatesUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    async execute(): Promise<void> {
        try {
            const allMetadata = await this.metadataRepository.get();

            const allMetadataWithoutDuplicates = this.removeDuplicatesById(allMetadata);

            await this.metadataRepository.save(allMetadataWithoutDuplicates);
        } catch (error) {
            console.error("Error processing programs:", error);
            throw error;
        }
    }

    private removeDuplicatesById(allMetadata: any[]) {
        let processedData: ProcessVisualization = {
            dashboards: [],
            indicators: [],
            legendSets: [],
            visualizations: [],
            indicatorTypes: [],
        };

        for (const metadata of allMetadata) {
            this.combineData(processedData, metadata);
        }

        console.log(`Processed files successfully!`);
        return processedData;
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

        if (Array.isArray(parsedData.indicators))
            addUniqueItems(processedData.indicators, parsedData.indicators);
        if (Array.isArray(parsedData.legendSets))
            addUniqueItems(processedData.legendSets, parsedData.legendSets);
        if (Array.isArray(parsedData.visualizations))
            addUniqueItems(processedData.visualizations, parsedData.visualizations);
        if (Array.isArray(parsedData.indicatorTypes))
            addUniqueItems(processedData.indicatorTypes, parsedData.indicatorTypes);
        if (Array.isArray(parsedData.dashboards))
            addUniqueItems(processedData.dashboards, parsedData.dashboards);
    }
}
