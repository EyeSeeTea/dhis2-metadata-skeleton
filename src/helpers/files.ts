import { Future, FutureData } from "$/domain/entities/generic/Future";
import fs from "fs/promises";
import path from "path";

export function validateFiles(inputPath: string): FutureData<string | null> {
    const folderName = path.basename(inputPath);

    return Future.fromPromise(getJsonFileNames(inputPath)).map(fileNames => {
        if (fileNames.length === 0) {
            return `No JSON files found in ${folderName} folder (${inputPath})`;
        }
        return null;
    });
}

export async function getJsonFileNames(inputPath: string): Promise<string[]> {
    const fileNames = await fs.readdir(inputPath);
    return fileNames.filter(
        fileName => fileName.endsWith(".json") && !fileName.includes("-sorted")
    );
}
