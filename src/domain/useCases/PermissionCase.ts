import { ProcessPermissions } from '../entities/ProcessPermissions';
import { FileRepository } from '../repository/FileRepository';

export class PermissionProcessor {
    constructor(private fileRepository: FileRepository) {}
   
    
        async process(): Promise<ProcessPermissions> {
            try {
                const files = await this.fileRepository.getJsonFiles();
                let processedData: ProcessPermissions = {
                    userGroups: [],
                    users: []
                };
    
                for (const file of files) {
                    const parsedData = await this.fileRepository.readJsonFile(file);
                    this.combineData(processedData, parsedData);
                }
    
                await this.fileRepository.writeProcessedData('1-permissions.json', processedData);
                console.log(`Processed ${files.length} files successfully!`);
                return processedData;
            } catch (error) {
                console.error('Error processing datasets:', error);
                throw error;
            }
        }
    
        private combineData(processedData: ProcessPermissions, parsedData: any): void {
            const addUniqueItems = (target: any[], source: any[]) => {
                source.forEach(item => {
                    const exists = target.some(existing => existing.id === item.id);
                    if (!exists) {
                        target.push(item);
                    }
                });
            };
            if (Array.isArray(parsedData.userGroups)) addUniqueItems(processedData.userGroups, parsedData.userGroups);
            if (Array.isArray(parsedData.users)) addUniqueItems(processedData.users, parsedData.users);
          
        }
    }