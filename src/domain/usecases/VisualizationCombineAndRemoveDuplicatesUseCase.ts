
import { ProcessedVisualization } from "../entities/ProcessedVisualization";
import { MetadataRepository } from "../repositories/MetadataRepository";
import { concatUnique } from "./helpers/concatUnique";

export class VisualizationCombineAndRemoveDuplicatesUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    async execute(): Promise<void> {
        try {
            const metadataPackages = await this.metadataRepository.get<ProcessedVisualization>();

            const metadataPackagesWithoutDuplicates =
                this.combineAndRemoveDuplicatesById(metadataPackages);

            await this.metadataRepository.save<ProcessedVisualization>(
                metadataPackagesWithoutDuplicates
            );
        } catch (error) {
            console.error("Error processing programs:", error);
            throw error;
        }
    }

    private combineAndRemoveDuplicatesById(
        metadataPackages: ProcessedVisualization[]
    ): ProcessedVisualization {
        const initProcessedVisualization: ProcessedVisualization = {
            dashboards: [],
            indicators: [],
            legendSets: [],
            visualizations: [],
            indicatorTypes: [],
        };

        const processedVisualization = metadataPackages.reduce((acc, data) => {
            return {
                ...acc,
                dashboards: concatUnique(acc.dashboards, data.dashboards),
                indicators: concatUnique(acc.indicators, data.indicators),
                legendSets: concatUnique(acc.legendSets, data.legendSets),
                visualizations: concatUnique(acc.visualizations, data.visualizations),
                indicatorTypes: concatUnique(acc.indicatorTypes, data.indicatorTypes),
            };
        }, initProcessedVisualization);

        console.debug(`Processed files successfully!`);
        return processedVisualization;
    }
}
