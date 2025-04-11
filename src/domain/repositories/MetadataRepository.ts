export interface MetadataRepository {
    get(): Promise<any[]>;
    save(data: any): Promise<void>;
}
