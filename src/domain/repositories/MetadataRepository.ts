import { FutureData } from "$/domain/entities/generic/Future";
import { MetadataPackage } from "../entities/MetadataPackage";

export interface MetadataRepository {
    get<T>(): FutureData<MetadataPackage<T>[]>;
    save<T>(data: MetadataPackage<T>): FutureData<void>;
}
