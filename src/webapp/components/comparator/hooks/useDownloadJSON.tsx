import { JSONContent } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import { useAppContext } from "$/webapp/contexts/app-context";
import { useCallback } from "react";

type DownloadJSONState = {
    downloadJSON: () => void;
};

export function useDownloadJSON(jsonContent: Maybe<JSONContent>): DownloadJSONState {
    const { compositionRoot } = useAppContext();

    const downloadJSON = useCallback(() => {
        if (!jsonContent) return;

        compositionRoot.downloadFile.execute({
            fileName: "merged-metadata.json",
            content: JSON.stringify(jsonContent, null, 2),
            contentType: "application/json",
        });
    }, [compositionRoot, jsonContent]);

    return {
        downloadJSON: downloadJSON,
    };
}
