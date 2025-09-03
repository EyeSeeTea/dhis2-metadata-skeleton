import { JSONContent } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import { useCallback, useEffect, useState } from "react";

type JSONComparatorProps = {
    hideButton: boolean;
    jsonContent: Maybe<JSONContent>;
};

type JSONComparatorState = {
    sortedMetadata: JSONComparatorProps;
    unsortedMetadata: JSONComparatorProps;
    uploadSorted: (file: Maybe<File>) => void;
    uploadUnsorted: (file: Maybe<File>) => void;
};

export function useJSONComparator(): JSONComparatorState {
    const [hideUnsortedButton, setHideUnsortedButton] = useState(false);
    const [hideSortedButton, setHideSortedButton] = useState(false);
    const [jsonContentUnsorted, setJsonContentUnsorted] = useState<Maybe<JSONContent>>(undefined);
    const [jsonContentSorted, setJsonContentSorted] = useState<Maybe<JSONContent>>(undefined);

    useEffect(() => {
        const { json1Parsed, json2Parsed } = parseJSONFromEnvInput();

        if (json1Parsed) {
            setHideSortedButton(true);
            setJsonContentSorted(json1Parsed);
        }
        if (json2Parsed) {
            setHideUnsortedButton(true);
            setJsonContentUnsorted(json2Parsed);
        }
    }, []);

    const onFileChange = useCallback(
        async (file: Maybe<File>, setJsonContent: (value: Maybe<JSONContent>) => void) => {
            if (!file) return setJsonContent(undefined);

            try {
                const jsonData = await file.text();
                const jsonParsed = JSON.parse(jsonData);
                setJsonContent(jsonParsed);
            } catch (error) {
                console.error("Error getting JSON:", error);
                setJsonContent(undefined);
            }
        },
        []
    );

    const uploadUnsorted = useCallback(
        (file: Maybe<File>) => onFileChange(file, setJsonContentUnsorted),
        []
    );

    const uploadSorted = useCallback(
        (file: Maybe<File>) => onFileChange(file, setJsonContentSorted),
        []
    );

    return {
        sortedMetadata: {
            hideButton: hideSortedButton,
            jsonContent: jsonContentSorted,
        },
        unsortedMetadata: {
            hideButton: hideUnsortedButton,
            jsonContent: jsonContentUnsorted,
        },
        uploadSorted: uploadSorted,
        uploadUnsorted: uploadUnsorted,
    };
}

const json1 = import.meta.env.VITE_METADATA_JSON_1;
const json2 = import.meta.env.VITE_METADATA_JSON_2;

function parseJSONFromEnvInput(): {
    json1Parsed: Maybe<JSONContent>;
    json2Parsed: Maybe<JSONContent>;
} {
    const json1Parsed = json1 ? JSON.parse(json1) : undefined;
    const json2Parsed = json2 ? JSON.parse(json2) : undefined;

    return { json1Parsed, json2Parsed };
}
