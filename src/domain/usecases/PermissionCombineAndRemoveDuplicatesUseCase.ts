import { ProcessedPermissions } from "../entities/ProcessedPermissions";
import { MetadataRepository } from "../repositories/MetadataRepository";
import _ from "../entities/generic/Collection";
import { concatUnique } from "./helpers/concatUnique";

export class PermissionCombineAndRemoveDuplicatesUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    async execute(): Promise<void> {
        try {
            const metadataPackages = await this.metadataRepository.get<ProcessedPermissions>();

            const metadataPackagesWithoutDuplicates =
                this.combineAndRemoveDuplicatesById(metadataPackages);

            await this.metadataRepository.save<ProcessedPermissions>(
                metadataPackagesWithoutDuplicates
            );
        } catch (error) {
            console.error("Error processing datasets:", error);
            throw error;
        }
    }

    private combineAndRemoveDuplicatesById(
        metadataPackages: ProcessedPermissions[]
    ): ProcessedPermissions {
        const initProcessedPermissions: ProcessedPermissions = {
            userGroups: [],
            users: [],
        };

        const processedPermissions = metadataPackages.reduce((acc, data) => {
            return {
                ...acc,
                userGroups: concatUnique(acc.userGroups, data.userGroups),
                users: concatUnique(acc.users, data.users),
            };
        }, initProcessedPermissions);

        console.debug(`Processed files successfully!`);
        return processedPermissions;
    }
}
