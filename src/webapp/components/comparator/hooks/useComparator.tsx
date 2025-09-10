import { JSONContent } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    applyOps,
    buildRows,
    Choice,
    Row,
} from "$/webapp/components/comparator/ComparatorViewModel";

type ComparatorProps = {
    hideButton: boolean;
    jsonContent: Maybe<JSONContent>;
    upload: (file: Maybe<File>) => void;
};

type ComparatorState = {
    choiceCounts: Record<Choice, number>;
    mergedJSON: Maybe<JSONContent>;
    mergedSelection: Record<string, Choice>;
    rows: Row[];
    sortedMetadata: ComparatorProps;
    unsortedMetadata: ComparatorProps;
    updateChoice: (p: string, c: Choice) => void;
};

export function useComparator(): ComparatorState {
    const [hideUnsortedButton, setHideUnsortedButton] = useState(false);
    const [hideSortedButton, setHideSortedButton] = useState(false);
    const [jsonContentUnsorted, setJsonContentUnsorted] = useState<Maybe<JSONContent>>(undefined);
    const [jsonContentSorted, setJsonContentSorted] = useState<Maybe<JSONContent>>(undefined);
    const [mergedSelection, setChoices] = useState<Record<string, Choice>>({});

    const rows = useMemo(
        () =>
            jsonContentSorted && jsonContentUnsorted
                ? buildRows(jsonContentSorted, jsonContentUnsorted)
                : [],
        [jsonContentSorted, jsonContentUnsorted]
    );

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

    useEffect(() => {
        const def = rows.reduce<Record<string, Choice>>(
            (acc, r) => ({ ...acc, [r.path]: acc[r.path] ?? "sorted" }),
            {}
        );
        setChoices(def);
    }, [rows]);

    const chosenOps = useMemo(
        () => rows.filter(r => mergedSelection[r.path] === "unsorted").map(r => r.op),
        [rows, mergedSelection]
    );

    const mergedJSON = useMemo(
        () => (jsonContentSorted ? applyOps(jsonContentSorted, chosenOps) : undefined),
        [jsonContentSorted, chosenOps]
    );

    const choiceCounts = useMemo(
        () =>
            Object.values(mergedSelection).reduce((acc, c) => ({ ...acc, [c]: acc[c] + 1 }), {
                sorted: 0,
                unsorted: 0,
            } as Record<Choice, number>),
        [mergedSelection]
    );

    const onFileChange = useCallback(
        async (file: Maybe<File>, setJsonContent: (value: Maybe<JSONContent>) => void) => {
            if (!file) return setJsonContent(undefined);

            try {
                const jsonData = await file.text();
                const jsonParsed = JSON.parse(jsonData);
                setJsonContent(jsonParsed);
            } catch (error) {
                console.error("Error parsing JSON file:", error);
                setJsonContent(undefined);
            }
        },
        []
    );

    const updateChoice = useCallback(
        (path: string, choice: Choice) => setChoices(prev => ({ ...prev, [path]: choice })),
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
        choiceCounts: choiceCounts,
        mergedJSON: mergedJSON,
        mergedSelection: mergedSelection,
        rows: rows,
        sortedMetadata: {
            hideButton: hideSortedButton,
            jsonContent: jsonContentSorted,
            upload: uploadSorted,
        },
        unsortedMetadata: {
            hideButton: hideUnsortedButton,
            jsonContent: jsonContentUnsorted,
            upload: uploadUnsorted,
        },
        updateChoice: updateChoice,
    };
}

const json1 = import.meta.env.VITE_METADATA_JSON_1;
const json2 = import.meta.env.VITE_METADATA_JSON_2;

function parseJSONFromEnvInput(): {
    json1Parsed: Maybe<JSONContent>;
    json2Parsed: Maybe<JSONContent>;
} {
    let json1Parsed: Maybe<JSONContent> = undefined;
    let json2Parsed: Maybe<JSONContent> = undefined;

    try {
        json1Parsed = json1 ? JSON.parse(json1) : undefined;
    } catch (error) {
        console.error("Error parsing json1:", error);
        json1Parsed = undefined;
    }

    try {
        json2Parsed = json2 ? JSON.parse(json2) : undefined;
    } catch (error) {
        console.error("Error parsing json2:", error);
        json2Parsed = undefined;
    }

    return { json1Parsed: json1Parsed, json2Parsed: json2Parsed };
}
