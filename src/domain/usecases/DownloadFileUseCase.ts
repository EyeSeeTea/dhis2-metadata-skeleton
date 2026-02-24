type DownloadFileProps = {
    fileName: string;
    content: string;
    contentType: string;
};

export class DownloadFileUseCase {
    constructor() {}

    public execute(options: DownloadFileProps): void {
        const { fileName, content, contentType } = options;

        const blob = new Blob([content], { type: contentType });
        const element = document.createElement("a");
        const url = URL.createObjectURL(blob);

        element.href = url;
        element.download = fileName;
        element.click();
        URL.revokeObjectURL(url);
    }
}
