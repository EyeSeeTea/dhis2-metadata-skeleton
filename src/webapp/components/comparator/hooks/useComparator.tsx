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
        async function fetchJsonFromTemp() {
            try {
                const [sortedRes, unsortedRes] = await Promise.all([
                    fetch(FILE1_PATH, { cache: "no-store" }).catch(() => undefined),
                    fetch(FILE2_PATH, { cache: "no-store" }).catch(() => undefined),
                ]);

                if (sortedRes && sortedRes.ok) {
                    const sorted = (await sortedRes.json()) as JSONContent;
                    setHideSortedButton(true);
                    setJsonContentSorted(sorted);
                }
                if (unsortedRes && unsortedRes.ok) {
                    const unsorted = (await unsortedRes.json()) as JSONContent;
                    setHideUnsortedButton(true);
                    setJsonContentUnsorted(unsorted);
                }
            } catch (error) {
                console.error("Error loading JSON from temp files:", error);
            }
        }

        fetchJsonFromTemp();
    }, []);

    useEffect(() => {
        const def = rows.reduce<Record<string, Choice>>(
            (acc, r) => ({ ...acc, [r.path]: acc[r.path] ?? Choice.SORTED }),
            {}
        );
        setChoices(def);
    }, [rows]);

    const chosenOps = useMemo(
        () => rows.filter(r => mergedSelection[r.path] === Choice.UNSORTED).map(r => r.op),
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

const FILE1_PATH = "/.tmp/file1.json";
const FILE2_PATH = "/.tmp/file2.json";
