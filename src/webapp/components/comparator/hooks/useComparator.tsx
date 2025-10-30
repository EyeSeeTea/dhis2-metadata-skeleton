import { useState, useCallback, useEffect, useMemo } from "react";
import { JSONContent } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import * as jsondiffpatch from "jsondiffpatch";

const FILE1_PATH = "/temp/file1.json";
const FILE2_PATH = "/temp/file2.json";

export type ComparatorState = {
    hideLeftButton: boolean;
    hideRightButton: boolean;
    leftText: string;
    mergedJson: Maybe<JSONContent>;
    mergedText: string;
    rightText: string;
    acceptLeft: () => void;
    applyMergedJson: (mergedJson: JSONContent) => void;
    acceptRight: () => void;
    handleMergedChange: (value: Maybe<string>) => void;
    uploadLeft: (file: Maybe<File>) => Promise<void>;
    uploadRight: (file: Maybe<File>) => Promise<void>;
};

export function useComparator(): ComparatorState {
    const [leftJson, setLeftJson] = useState<Maybe<JSONContent>>(undefined);
    const [rightJson, setRightJson] = useState<Maybe<JSONContent>>(undefined);
    const [mergedJson, setMergedJson] = useState<Maybe<JSONContent>>(undefined);
    const [hideLeftButton, setHideLeftButton] = useState(false);
    const [hideRightButton, setHideRightButton] = useState(false);

    useEffect(() => {
        async function fetchJsonFromTemp() {
            try {
                const [leftJsonResponse, rightJsonResponse] = await Promise.all([
                    fetch(FILE1_PATH, { cache: "no-store" }).catch(() => undefined),
                    fetch(FILE2_PATH, { cache: "no-store" }).catch(() => undefined),
                ]);

                if (leftJsonResponse && leftJsonResponse.ok) {
                    const left = (await leftJsonResponse.json()) as JSONContent;
                    setHideLeftButton(true);
                    setLeftJson(left);
                }
                if (rightJsonResponse && rightJsonResponse.ok) {
                    const right = (await rightJsonResponse.json()) as JSONContent;
                    setHideRightButton(true);
                    setRightJson(right);
                }
            } catch (error) {
                console.error("Error loading JSON from temp files:", error);
            }
        }

        fetchJsonFromTemp();
    }, []);

    useEffect(() => {
        if (leftJson && !mergedJson) {
            setMergedJson(cloneJson(leftJson));
        }
    }, [leftJson, mergedJson]);

    const uploadLeft = useCallback(async (file: Maybe<File>) => {
        if (!file) {
            setLeftJson(undefined);
            setMergedJson(undefined);
            return;
        }

        try {
            const text = await file.text();
            const json = parseFromEditor(text);
            if (json) {
                setLeftJson(json);
                setMergedJson(cloneJson(json));
            }
        } catch (error) {
            console.error("Error parsing left JSON file:", error); // snackbar
        }
    }, []);

    const uploadRight = useCallback(async (file: Maybe<File>) => {
        if (!file) {
            setRightJson(undefined);
            return;
        }

        try {
            const text = await file.text();
            const json = parseFromEditor(text);
            setRightJson(json);
        } catch (error) {
            console.error("Error parsing right JSON file:", error); // snackbar
        }
    }, []);

    const acceptLeft = useCallback(() => {
        if (leftJson) {
            setMergedJson(cloneJson(leftJson));
        }
    }, [leftJson]);

    const acceptRight = useCallback(() => {
        if (rightJson) {
            setMergedJson(cloneJson(rightJson));
        }
    }, [rightJson]);

    const leftText = useMemo(() => formatJson(leftJson), [leftJson]);
    const rightText = useMemo(() => formatJson(rightJson), [rightJson]);
    const mergedText = useMemo(() => formatJson(mergedJson), [mergedJson]);

    const parseFromEditor = useCallback((text: string): Maybe<JSONContent> => {
        try {
            return JSON.parse(text) as JSONContent;
        } catch {
            return undefined;
        }
    }, []);

    const handleMergedChange = useCallback(
        (value: Maybe<string>) => {
            if (value) {
                const parsed = parseFromEditor(value);
                if (parsed) {
                    const sortedJson = sortJSONKeys(parsed);
                    setMergedJson(sortedJson);
                }
            }
        },
        [parseFromEditor]
    );

    const applyMergedJson = useCallback((merged: JSONContent) => {
        setMergedJson(merged);
    }, []);

    return {
        leftText: leftText,
        rightText: rightText,
        mergedText: mergedText,
        mergedJson: mergedJson,
        hideLeftButton: hideLeftButton,
        hideRightButton: hideRightButton,
        acceptLeft: acceptLeft,
        acceptRight: acceptRight,
        handleMergedChange: handleMergedChange,
        applyMergedJson: applyMergedJson,
        uploadLeft: uploadLeft,
        uploadRight: uploadRight,
    };
}

const sortJSONKeys = (obj: any): any => {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(sortJSONKeys);

    return Object.keys(obj)
        .sort()
        .reduce((result: any, key: string) => {
            result[key] = sortJSONKeys(obj[key]);
            return result;
        }, {});
};

const formatJson = (json: Maybe<JSONContent>) => {
    if (!json) return "";

    try {
        const sorted = sortJSONKeys(json);
        return JSON.stringify(sorted, null, 2);
    } catch {
        return "";
    }
};

function cloneJson(obj: JSONContent): JSONContent {
    return jsondiffpatch.clone(obj) as JSONContent;
}
