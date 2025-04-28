import { ProcessVisualization } from "../entities/ProcessVisualization";
import { MetadataRepository } from "../repositories/MetadataRepository";
import { appendUnique } from "./helpers/appendUnique";

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

    private removeDuplicatesById(parsedData: any[]) {
        const initData: ProcessVisualization = {
            dashboards: [],
            indicators: [],
            legendSets: [],
            visualizations: [],
            indicatorTypes: [],
        };

        const processedData = parsedData.reduce((acc, data) => {
            return {
                ...acc,
                dashboards: appendUnique(acc.dashboards, data.dashboards),
                indicators: appendUnique(acc.indicators, data.indicators),
                legendSets: appendUnique(acc.legendSets, data.legendSets),
                visualizations: appendUnique(acc.visualizations, data.visualizations),
                indicatorTypes: appendUnique(acc.indicatorTypes, data.indicatorTypes),
            };
        }, initData);

        console.log(`Processed files successfully!`);
        return processedData;
    }
}
