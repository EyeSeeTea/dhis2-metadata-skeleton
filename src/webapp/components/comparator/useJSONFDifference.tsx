import { Maybe } from "$/utils/ts-utils";
import { useCallback, useMemo, useState } from "react";

type JSONContent = Record<string, unknown>;

export function useJSONDifference() {
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
        return generateJsonDiff(jsonContentSorted, jsonContentUnsorted).join("\n");
    }, [jsonContentSorted, jsonContentUnsorted]);

    return {
        jsonDifference: jsonDifference,
        jsonContentSorted: jsonContentSorted,
        jsonContentUnsorted: jsonContentUnsorted,
        uploadUnsorted: uploadUnsorted,
        uploadSorted: uploadSorted,
    };
}

function generateJsonDiff(
    originalJson: JSONContent,
    comparisonJson: JSONContent,
    path: string[] = []
): string[] {
    const sortedKeys = Object.keys(originalJson);
    const unsortedKeys = Object.keys(comparisonJson);

    return Array.from(new Set([...sortedKeys, ...unsortedKeys])).flatMap(key => {
        const keyStr = `"${key}"`;
        const indent = "  ";

        const originalValue = originalJson[key];
        const comparisonValue = comparisonJson[key];
        const originalJSONHasKey = key in originalJson;
        const comparisonJSONHasKey = key in comparisonJson;

        if (!originalJSONHasKey && comparisonJSONHasKey) {
            return [`> ${indent}${keyStr}: ${JSON.stringify(comparisonValue)}`];
        }

        if (originalJSONHasKey && !comparisonJSONHasKey) {
            return [`< ${indent}${keyStr}: ${JSON.stringify(originalValue)}`];
        }

        if (isObject(originalValue) && isObject(comparisonValue)) {
            return generateJsonDiff(originalValue, comparisonValue, [...path, key]);
        }

        if (originalValue !== comparisonValue) {
            return [
                `< ${indent}${keyStr}: ${JSON.stringify(originalValue)}`,
                `---`,
                `> ${indent}${keyStr}: ${JSON.stringify(comparisonValue)}`,
            ];
        }

        return [];
    });
}

const isObject = (val: any): val is JSONContent =>
    typeof val === "object" && val !== null && !Array.isArray(val);
