import fs from 'fs/promises';
import path from 'path';

export class FileRepository {
    private folderName: string;
    constructor(
        private capturePath: string,
        private outputPath: string
    ) {
        this.folderName = path.basename(capturePath);
    }

    async validateFiles(): Promise<string | null> {
        const files = await this.getJsonFiles();
        if (files.length === 0) {
            return `No JSON files found in ${this.folderName} folder (${this.capturePath})`;
        }
        return null;
    }

    async getJsonFiles(): Promise<string[]> {
        const files = await fs.readdir(this.capturePath);
        return files.filter(file => 
            file.endsWith('.json') && 
            !file.includes('-sorted')
        );
    }

    async readJsonFile(filename: string): Promise<any> {
        const filePath = path.join(this.capturePath, filename);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    }

    async writeProcessedData(filename: string, data: any): Promise<void> {
        const outputFile = path.join(this.outputPath, filename);
        await fs.writeFile(
            outputFile,
            JSON.stringify(data, null, 2)
        );
    }
}