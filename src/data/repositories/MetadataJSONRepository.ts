import path from "path";
import fs from "fs/promises";
import { MetadataRepository } from "../../domain/repositories/MetadataRepository";
import { MetadataPackage } from "../../domain/entities/MetadataPackage";


//TODO: allow different names per output file
const FILE_NAME = "output.json";

export class MetadataJSONRepository implements MetadataRepository {
    private folderName: string;
    constructor(private capturePath: string, private outputPath: string) {
        this.folderName = path.basename(capturePath);
    }
    async get<T>(): Promise<MetadataPackage<T>[]> {
        const fileNames = await this.getJsonFileNames();

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

    private async validateFiles(): Promise<string | null> {
        const fileNames = await this.getJsonFileNames();
        if (fileNames.length === 0) {
            return `No JSON files found in ${this.folderName} folder (${this.capturePath})`;
        }
        return null;
    }

    private async getJsonFileNames(): Promise<string[]> {
        const fileNames = await fs.readdir(this.capturePath);
        return fileNames.filter(
            fileName => fileName.endsWith(".json") && !fileName.includes("-sorted")
        );
    }

    private async readJsonFile(fileName: string) {
        const filePath = path.join(this.capturePath, fileName);
        const data = await fs.readFile(filePath, "utf-8");
        const parsedData = JSON.parse(data);

        return parsedData;
    }
}
