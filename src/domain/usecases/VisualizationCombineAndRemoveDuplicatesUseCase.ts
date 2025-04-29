import { ProcessedDataSetProgram } from "../entities/ProcessedDataSetProgram";
import { ProcessedVisualization } from "../entities/ProcessedVisualization";
import { MetadataRepository } from "../repositories/MetadataRepository";
import { appendUnique } from "./helpers/appendUnique";

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
                dashboards: appendUnique(acc.dashboards, data.dashboards),
                indicators: appendUnique(acc.indicators, data.indicators),
                legendSets: appendUnique(acc.legendSets, data.legendSets),
                visualizations: appendUnique(acc.visualizations, data.visualizations),
                indicatorTypes: appendUnique(acc.indicatorTypes, data.indicatorTypes),
            };
        }, initProcessedVisualization);

        console.log(`Processed files successfully!`);
        return processedVisualization;
    }
}
