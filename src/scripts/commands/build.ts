import { command } from "cmd-ts";
import path from "path";
import { MetadataJSONRepository } from "$/data/repositories/MetadataJSONRepository";
import { DataSetProgramCombineAndRemoveDuplicatesUseCase } from "$/domain/usecases/DataSetProgramCombineAndRemoveDuplicatesUseCase";
import { PermissionCombineAndRemoveDuplicatesUseCase } from "$/domain/usecases/PermissionCombineAndRemoveDuplicatesUseCase";
import { VisualizationCombineAndRemoveDuplicatesUseCase } from "$/domain/usecases/VisualizationCombineAndRemoveDuplicatesUseCase";
import { validateFiles } from "$/helpers/files";

export const build = command({
    name: "metadata build",
    description: "Build metadata from JSON files",
    args: {},
    handler: async () => {
        try {
            console.debug("Building metadata...");

            const capturePath = path.join(__dirname, "../capture");
            const visualizationPath = path.join(__dirname, "../visualizations");
            const permissionPath = path.join(__dirname, "../permissions");

            const outputPath = path.join(__dirname, "../output");

            const captureRepository = new MetadataJSONRepository(capturePath, outputPath);
            const visualizationRepository = new MetadataJSONRepository(
                visualizationPath,
                outputPath
            );
            const permissionRepository = new MetadataJSONRepository(permissionPath, outputPath);

            const validationResults = await Promise.all([
                validateFiles(capturePath),
                validateFiles(visualizationPath),
                validateFiles(permissionPath),
            ]);

            const errors = validationResults.filter(result => result !== null);

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
            await dataSetProgramProcessor.execute();

            // Process permissions
            const dataSetpermissionProcessor = new PermissionCombineAndRemoveDuplicatesUseCase(
                permissionRepository
            );
            await dataSetpermissionProcessor.execute();

            // Process visualizations
            const visualizationProcessor = new VisualizationCombineAndRemoveDuplicatesUseCase(
                visualizationRepository
            );
            await visualizationProcessor.execute();
        } catch (error) {
            console.error("Error building metadata:", error);
            process.exit(1);
        }
    },
});
