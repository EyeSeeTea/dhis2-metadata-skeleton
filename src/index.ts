import path from 'path';
import { FileRepository } from './domain/repository/FileRepository';
import { DataSetProgramProcessor } from './domain/useCases/DataSetProgramCase';
//import { ProgramProcessor } from './domain/useCases/ProgramUseCase';
import { PermissionProcessor } from './domain/useCases/PermissionCase';
import { VisualizationProcessor } from './domain/useCases/VisualizationCase';

async function main() {

    const capturePath = path.join(__dirname, '../capture');
    const visualizationPath = path.join(__dirname, '../visualizations');
    const permissionPath = path.join(__dirname, '../permissions');

    const outputPath = path.join(__dirname, '../output');
    
    const captureRepository = new FileRepository(capturePath, outputPath);
    const visualizationRepository = new FileRepository(visualizationPath, outputPath);
    const permissionRepository = new FileRepository(permissionPath, outputPath);

    const validationResults = await Promise.all([
        captureRepository.validateFiles(),
        visualizationRepository.validateFiles(),
        permissionRepository.validateFiles()
    ]);

    const errors = validationResults.filter(result => result !== null);
    
    if (errors.length > 0) {
        console.log('\n----------------------------------------');
        errors.forEach(error => console.log('  Validation Message:', error));
        console.log('----------------------------------------\n');
        process.exit(1);
    }
    
    // Process datasets & program
    const dataSetProgramProcessor = new DataSetProgramProcessor(captureRepository);
    await dataSetProgramProcessor.process();
    
    // Process programs
  //  const programProcessor = new ProgramProcessor(captureRepository);
   // await programProcessor.process();

    // Process permissions
    const permissionProcessor = new PermissionProcessor(permissionRepository);
    await permissionProcessor.process();

    // Process visualizations
    const visualizationProcessor = new VisualizationProcessor(visualizationRepository);
    await visualizationProcessor.process();
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});