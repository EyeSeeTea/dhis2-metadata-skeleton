import { ProcessPermissions } from "../entities/ProcessPermissions";
import { Ref } from "../entities/Ref";
import { MetadataRepository } from "../repositories/MetadataRepository";

export class PermissionRemoveDuplicatesUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    async execute(): Promise<void> {
        try {
            const allMetadata = await this.metadataRepository.get();

            const allMetadataWithoutDuplicates = this.removeDuplicatesById(allMetadata);

            await this.metadataRepository.save(allMetadataWithoutDuplicates);
        } catch (error) {
            console.error("Error processing datasets:", error);
            throw error;
        }
    }

    private removeDuplicatesById(allMetadata: any[]) {
        let processedData: ProcessPermissions = {
            userGroups: [],
            users: [],
        };
        for (const metadata of allMetadata) {
            this.combineData(processedData, metadata);
        }

        console.log(`Processed files successfully!`);
        return processedData;
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
        if (Array.isArray(parsedData.userGroups))
            addUniqueItems(processedData.userGroups, parsedData.userGroups);
        if (Array.isArray(parsedData.users)) addUniqueItems(processedData.users, parsedData.users);
    }
}
