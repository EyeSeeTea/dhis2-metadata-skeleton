import path from "path";
import fs from "fs/promises";
import { MetadataRepository } from "$/domain/repositories/MetadataRepository";
import { MetadataPackage } from "$/domain/entities/MetadataPackage";
import { getJsonFileNames } from "$/helpers/files";
import { Future, FutureData } from "$/domain/entities/generic/Future";

function getOutputFileName(inputPath: string): string {
    const folder = path.basename(inputPath);
    return `${folder}.json`;
}

export class MetadataJSONRepository implements MetadataRepository {
    constructor(private inputPath: string, private outputPath: string) {}

    get<T>(): FutureData<MetadataPackage<T>[]> {
        return Future.fromPromise(this.getMetadataPackagesAsync<T>());
    }

    save<T>(data: MetadataPackage<T>): FutureData<void> {
        const fileName = getOutputFileName(this.inputPath);
        const outputFile = path.join(this.outputPath, fileName);

        return Future.fromPromise(fs.writeFile(outputFile, JSON.stringify(data, null, 2)));
    }

    async getMetadataPackagesAsync<T>(): Promise<MetadataPackage<T>[]> {
        const fileNames = await getJsonFileNames(this.inputPath);
        const allData = await Promise.all(
            fileNames.map(fileName => {
                return this.readJsonFile(fileName);
            })
        );

        return allData;
    }

    private async readJsonFile(fileName: string) {
        const filePath = path.join(this.inputPath, fileName);
        const data = await fs.readFile(filePath, "utf-8");
        const parsedData = JSON.parse(data);

        return parsedData;
    }
}
