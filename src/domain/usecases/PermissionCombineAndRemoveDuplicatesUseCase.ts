import { FutureData } from "$/domain/entities/generic/Future";
import { ProcessedPermissions } from "../entities/ProcessedPermissions";
import { MetadataRepository } from "../repositories/MetadataRepository";
import { concatUnique } from "./helpers/concatUnique";

export class PermissionCombineAndRemoveDuplicatesUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    execute(): FutureData<void> {
        return this.metadataRepository.get<ProcessedPermissions>().flatMap(metadataPackages => {
            const metadataPackagesWithoutDuplicates =
                this.combineAndRemoveDuplicatesById(metadataPackages);
            return this.metadataRepository.save<ProcessedPermissions>(
                metadataPackagesWithoutDuplicates
            );
        });
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
