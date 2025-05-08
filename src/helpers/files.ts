import fs from "fs/promises";
import path from "path";

export async function validateFiles(
    inputPath: string
): Promise<string | null> {
    const folderName = path.basename(inputPath);
    const fileNames = await getJsonFileNames(inputPath);
    if (fileNames.length === 0) {
        return `No JSON files found in ${folderName} folder (${inputPath})`;
    }
    return null;
}

export async function getJsonFileNames(inputPath : string): Promise<string[]> {
    const fileNames = await fs.readdir(inputPath);
    return fileNames.filter(
        fileName => fileName.endsWith(".json") && !fileName.includes("-sorted")
    );
}
