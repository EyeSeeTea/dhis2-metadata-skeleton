import path from "path";
import fs from "fs/promises";
import { MetadataRepository } from "../../domain/repositories/MetadataRepository";
import { MetadataPackage } from "../../domain/entities/MetadataPackage";
import { getJsonFileNames } from "../../helpers/files";

//TODO: allow different names per output file

const FILE_NAME = "output.json";

export class MetadataJSONRepository implements MetadataRepository {
    constructor(private inputPath: string, private outputPath: string) {}

    async get<T>(): Promise<MetadataPackage<T>[]> {
        const fileNames = await getJsonFileNames(this.inputPath);

        const allData = await Promise.all(
            fileNames.map(fileName => {
                return this.readJsonFile(fileName);
            })
        );

        return allData;
    }

    async save<T>(data: MetadataPackage<T>): Promise<void> {
        const outputFile = path.join(this.outputPath, FILE_NAME);
        await fs.writeFile(outputFile, JSON.stringify(data, null, 2));
    }

    private async readJsonFile(fileName: string) {
        const filePath = path.join(this.inputPath, fileName);
        const data = await fs.readFile(filePath, "utf-8");
        const parsedData = JSON.parse(data);

        return parsedData;
    }
}
