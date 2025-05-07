import { command } from "cmd-ts";
import path from "path";
import { MetadataJSONRepository } from "../../data/repositories/MetadataJSONRepository";
import { DataSetProgramCombineAndRemoveDuplicatesUseCase } from "../../domain/usecases/DataSetProgramCombineAndRemoveDuplicatesUseCase";
import { PermissionCombineAndRemoveDuplicatesUseCase } from "../../domain/usecases/PermissionCombineAndRemoveDuplicatesUseCase";
import { VisualizationCombineAndRemoveDuplicatesUseCase } from "../../domain/usecases/VisualizationCombineAndRemoveDuplicatesUseCase";


export const build = command({
    name: "metadata build",
    description: "Build metadata from JSON files",
    args: {},
    handler: async () => {
        console.log("Building metadata...");
        
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

        //const validationResults = await Promise.all([
        //captureRepository.validateFiles(),
        //visualizationRepository.validateFiles(),
        //permissionRepository.validateFiles(),
        //]);

        //const errors = validationResults.filter(result => result !== null);

        //if (errors.length > 0) {
        //   console.log("\n----------------------------------------");
        //   errors.forEach(error => console.log("  Validation Message:", error));
        //   console.log("----------------------------------------\n");
        //  process.exit(1);
        //}

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
    },
});