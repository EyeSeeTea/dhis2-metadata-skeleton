import { ProcessPermissions } from "../entities/ProcessPermissions";
import { Ref } from "../entities/Ref";
import { MetadataRepository } from "../repositories/MetadataRepository";
import _ from "../entities/generic/Collection";
import { appendUnique } from "./helpers/appendUnique";

//Cambiar nombres de variables (allMetadata)

//Cambiar nombres en el index

//Cambiar nombre del file
export class PermissionRemoveDuplicatesUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    async execute(): Promise<void> {
        try { 
            //Añadir tipo al get y al save
            const allMetadata = await this.metadataRepository.get();

            const allMetadataWithoutDuplicates = this.removeDuplicatesById(allMetadata);

            await this.metadataRepository.save(allMetadataWithoutDuplicates);
        } catch (error) {
            console.error("Error processing datasets:", error);
            throw error;
        }
    }

    //Cambiar nombre y el tipo que devuelve y el any
    private removeDuplicatesById(parsedData: any[]) {
        const initData: ProcessPermissions = {
            userGroups: [],
            users: [],
        };

        const processedData = parsedData.reduce((acc, data) => {
            return {
                ...acc,
                userGroups: appendUnique(acc.userGroups, data.userGroups),
                users: appendUnique(acc.users, data.users),
            };
        }, initData);

        console.log(`Processed files successfully!`);
        return processedData;
    }
}
