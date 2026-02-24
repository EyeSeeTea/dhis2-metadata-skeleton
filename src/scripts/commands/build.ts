import { command } from "cmd-ts";
import path from "path";
import { MetadataJSONRepository } from "$/data/repositories/MetadataJSONRepository";
import { DataSetProgramCombineAndRemoveDuplicatesUseCase } from "$/domain/usecases/DataSetProgramCombineAndRemoveDuplicatesUseCase";
import { PermissionCombineAndRemoveDuplicatesUseCase } from "$/domain/usecases/PermissionCombineAndRemoveDuplicatesUseCase";
import { VisualizationCombineAndRemoveDuplicatesUseCase } from "$/domain/usecases/VisualizationCombineAndRemoveDuplicatesUseCase";
import { validateFiles } from "$/helpers/files";
import { Future } from "$/domain/entities/generic/Future";

export const build = command({
    name: "metadata build",
    description: "Build metadata from JSON files",
    args: {},
    handler: () => {
        console.debug("Building metadata...");

        const repoRoot = process.cwd();
        const capturePath = path.resolve(repoRoot, "capture");
        const visualizationPath = path.resolve(repoRoot, "visualizations");
        const permissionPath = path.resolve(repoRoot, "permissions");

        const outputPath = path.join(repoRoot, "output");

        const captureRepository = new MetadataJSONRepository(capturePath, outputPath);
        const visualizationRepository = new MetadataJSONRepository(visualizationPath, outputPath);
        const permissionRepository = new MetadataJSONRepository(permissionPath, outputPath);

        return Future.joinObj({
            validateCapture: validateFiles(capturePath),
            validateVisualization: validateFiles(visualizationPath),
            validatePermission: validateFiles(permissionPath),
        })
            .map(validationResults => {
                const errors = Object.values(validationResults).filter(result => result !== null);

                if (errors.length > 0) {
                    console.debug("\n----------------------------------------");
                    errors.forEach(error => console.debug("  Validation Message:", error));
                    console.debug("----------------------------------------\n");
                    throw new Error("Validation failed. Please check the errors above.");
                }

                // Process datasets & program
                const dataSetProgramProcessor = new DataSetProgramCombineAndRemoveDuplicatesUseCase(
                    captureRepository
                );
                dataSetProgramProcessor.execute().run(
                    () => {},
                    error => {
                        console.error("Error processing datasets:", error);
                        throw error;
                    }
                );

                // Process permissions
                const dataSetPermissionProcessor = new PermissionCombineAndRemoveDuplicatesUseCase(
                    permissionRepository
                );
                dataSetPermissionProcessor.execute().run(
                    () => {},
                    error => {
                        console.error("Error processing datasets:", error);
                        throw error;
                    }
                );

                // Process visualizations
                const visualizationProcessor = new VisualizationCombineAndRemoveDuplicatesUseCase(
                    visualizationRepository
                );
                visualizationProcessor.execute().run(
                    () => {},
                    error => {
                        console.error("Error processing visualizations:", error);
                        throw error;
                    }
                );
            })
            .run(
                () => {
                    console.debug("Metadata built successfully!");
                },
                error => {
                    console.error("Error building metadata:", error);
                    process.exit(1);
                }
            );
    },
});
