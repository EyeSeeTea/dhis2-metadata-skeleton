import path from "path";
import { DataSetProgramCombineAndRemoveDuplicatesUseCase } from "./domain/usecases/DataSetProgramCombineAndRemoveDuplicatesUseCase";
//import { ProgramRemoveDuplicatesUseCase } from './domain/usecases/ProgramRemoveDuplicatesUseCase';
import { PermissionRemoveDuplicatesUseCase } from "./domain/usecases/PermissionRemoveDuplicatesUseCase";
import { VisualizationRemoveDuplicatesUseCase } from "./domain/usecases/VisualizationRemoveDuplicatesUseCase";
import { MetadataJSONRepository } from "./data/repositories/MetadataJSONRepository";

async function main() {
    const capturePath = path.join(__dirname, "../capture");
    const visualizationPath = path.join(__dirname, "../visualizations");
    const permissionPath = path.join(__dirname, "../permissions");

    const outputPath = path.join(__dirname, "../output");

    const captureRepository = new MetadataJSONRepository(capturePath, outputPath);
    const visualizationRepository = new MetadataJSONRepository(visualizationPath, outputPath);
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
    const dataSetProgramProcessor = new DataSetProgramCombineAndRemoveDuplicatesUseCase(captureRepository);
    await dataSetProgramProcessor.execute();

    // Process permissions
    const permissionProcessor = new PermissionRemoveDuplicatesUseCase(permissionRepository);
    await permissionProcessor.execute();

    // Process visualizations
    const visualizationProcessor = new VisualizationRemoveDuplicatesUseCase(
        visualizationRepository
    );
    await visualizationProcessor.execute();
}

main().catch(error => {
    console.error("Error:", error);
    process.exit(1);
});
