import fs from "fs/promises";
import path from "path";

export async function validateFiles(
    capturePath: string
): Promise<string | null> {
    const folderName = path.basename(capturePath);
    const fileNames = await getJsonFileNames(capturePath);
    if (fileNames.length === 0) {
        return `No JSON files found in ${folderName} folder (${capturePath})`;
    }
    return null;
}

export async function getJsonFileNames(capturePath : string): Promise<string[]> {
    const fileNames = await fs.readdir(capturePath);
    return fileNames.filter(
        fileName => fileName.endsWith(".json") && !fileName.includes("-sorted")
    );
}
