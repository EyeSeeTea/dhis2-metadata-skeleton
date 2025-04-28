import { MetadataPackage } from "../entities/MetadataPackage";

export interface MetadataRepository {
    get<T>(): Promise<MetadataPackage<T>[]>;
    save<T>(data: MetadataPackage<T>): Promise<void>;
}

