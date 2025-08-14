import { JSONContent } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import { useAppContext } from "$/webapp/contexts/app-context";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useJSONDifference() {
    const { compositionRoot } = useAppContext();

    useEffect(() => {
        const { json1Parsed, json2Parsed } = parseJSONFromEnvInput();

        if (json1Parsed) {
            setHideUnsortedButton(true);
            setJsonContentUnsorted(json1Parsed);
        }
        if (json2Parsed) {
            setHideSortedButton(true);
            setJsonContentSorted(json2Parsed);
        }
    }, []);

    const [hideUnsortedButton, setHideUnsortedButton] = useState(false);
    const [hideSortedButton, setHideSortedButton] = useState(false);
    const [jsonContentUnsorted, setJsonContentUnsorted] = useState<Maybe<JSONContent>>(undefined);
    const [jsonContentSorted, setJsonContentSorted] = useState<Maybe<JSONContent>>(undefined);

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

    const jsonDifference = useMemo(() => {
        if (!jsonContentSorted || !jsonContentUnsorted) return [];
        return compositionRoot.generateJSONDifference.execute(
            jsonContentSorted,
            jsonContentUnsorted
        );
    }, [jsonContentSorted, jsonContentUnsorted]);

    return {
        hideUnsortedButton: hideUnsortedButton,
        hideSortedButton: hideSortedButton,
        jsonDifference: jsonDifference,
        jsonContentSorted: jsonContentSorted,
        jsonContentUnsorted: jsonContentUnsorted,
        uploadUnsorted: uploadUnsorted,
        uploadSorted: uploadSorted,
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
