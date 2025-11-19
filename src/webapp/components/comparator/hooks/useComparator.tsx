import { useState, useCallback, useEffect, useMemo } from "react";
import { JSONContent } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import {
    cloneJson,
    sortJSONKeys,
    formatJson,
    parseJson,
} from "$/webapp/components/comparator/hooks/utils/jsonUtils";

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
    const {
        leftJson: preloadedLeft,
        rightJson: preloadedRight,
        hasPreloadedData,
    } = useJsonFromTempFiles();

    const [leftJson, setLeftJson] = useState<Maybe<JSONContent>>(undefined);
    const [rightJson, setRightJson] = useState<Maybe<JSONContent>>(undefined);
    const [mergedJson, setMergedJson] = useState<Maybe<JSONContent>>(undefined);

    useEffect(() => {
        if (preloadedLeft) {
            const sorted = sortJSONKeys(preloadedLeft);
            if (JSONContent.isObject(sorted)) {
                setLeftJson(sorted);
            }
        }
        if (preloadedRight) {
            const sorted = sortJSONKeys(preloadedRight);
            if (JSONContent.isObject(sorted)) {
                setRightJson(sorted);
            }
        }
    }, [preloadedLeft, preloadedRight]);

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
            const json = parseJson(text);
            if (json) {
                const sorted = sortJSONKeys(json);
                if (JSONContent.isObject(sorted)) {
                    setLeftJson(sorted);
                    setMergedJson(cloneJson(sorted));
                }
            }
        } catch (error) {
            console.error("Error parsing left JSON file:", error);
        }
    }, []);

    const uploadRight = useCallback(async (file: Maybe<File>) => {
        if (!file) {
            setRightJson(undefined);
            return;
        }

        try {
            const text = await file.text();
            const json = parseJson(text);
            if (json) {
                const sorted = sortJSONKeys(json);
                if (JSONContent.isObject(sorted)) {
                    setRightJson(sorted);
                }
            }
        } catch (error) {
            console.error("Error parsing right JSON file:", error);
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

    const handleMergedChange = useCallback((value: Maybe<string>) => {
        if (!value) return;

        const parsed = parseJson(value);
        if (parsed) {
            const sorted = sortJSONKeys(parsed);
            if (sorted && JSONContent.isObject(sorted)) {
                setMergedJson(sorted);
            }
        }
    }, []);

    const applyMergedJson = useCallback((merged: JSONContent) => {
        setMergedJson(merged);
    }, []);

    const leftText = useMemo(() => formatJson(leftJson), [leftJson]);
    const rightText = useMemo(() => formatJson(rightJson), [rightJson]);
    const mergedText = useMemo(() => formatJson(mergedJson), [mergedJson]);

    return {
        leftText,
        rightText,
        mergedText,
        mergedJson,
        hideLeftButton: hasPreloadedData.leftJson,
        hideRightButton: hasPreloadedData.rightJson,
        acceptLeft,
        acceptRight,
        handleMergedChange,
        applyMergedJson,
        uploadLeft,
        uploadRight,
    };
}

function useJsonFromTempFiles() {
    const [leftJson, setLeftJson] = useState<Maybe<JSONContent>>(undefined);
    const [rightJson, setRightJson] = useState<Maybe<JSONContent>>(undefined);

    useEffect(() => {
        const fetchJsonFromTemp = async () => {
            const FILE1_PATH = "/.tmp/file1.json";
            const FILE2_PATH = "/.tmp/file2.json";

            try {
                const [leftResponse, rightResponse] = await Promise.all([
                    fetch(FILE1_PATH, { cache: "no-store" }).catch(() => null),
                    fetch(FILE2_PATH, { cache: "no-store" }).catch(() => null),
                ]);

                if (leftResponse?.ok) {
                    const left = await leftResponse.json();
                    setLeftJson(left);
                }
                if (rightResponse?.ok) {
                    const right = await rightResponse.json();
                    setRightJson(right);
                }
            } catch (error) {
                console.error("Error loading JSON from temp files:", error);
            }
        };

        fetchJsonFromTemp();
    }, []);

    return {
        leftJson,
        rightJson,
        hasPreloadedData: {
            leftJson: !!leftJson,
            rightJson: !!rightJson,
        },
    };
}
