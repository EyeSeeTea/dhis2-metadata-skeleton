import { FutureData } from "$/domain/entities/generic/Future";
import { ProcessedVisualization } from "../entities/ProcessedVisualization";
import { MetadataRepository } from "../repositories/MetadataRepository";
import { concatUnique } from "./helpers/concatUnique";

export class VisualizationCombineAndRemoveDuplicatesUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    execute(): FutureData<void> {
        return this.metadataRepository.get<ProcessedVisualization>().flatMap(metadataPackages => {
            const metadataPackagesWithoutDuplicates =
                this.combineAndRemoveDuplicatesById(metadataPackages);
            return this.metadataRepository.save<ProcessedVisualization>(
                metadataPackagesWithoutDuplicates
            );
        });
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
