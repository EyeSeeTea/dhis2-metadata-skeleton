import { ImportFile } from "$/webapp/components/import-file/ImportFile";

import React, { useState, useCallback } from "react";
import { styled } from "styled-components";

export const Comparator: React.FC = () => {
    const [jsonContentUnsorted, setJsonContentUnsorted] = useState<
        Record<string, unknown[]> | undefined
    >(undefined);
    const [jsonContentSorted, setJsonContentSorted] = useState<
        Record<string, unknown[]> | undefined
    >(undefined);

    const onFileChangeSorted = useCallback(async (file: File | undefined) => {
        if (!file) {
            setJsonContentSorted(undefined);
            return;
        }

        try {
            const jsonData = await file.text();
            const jsonParsed = JSON.parse(jsonData);
            setJsonContentSorted(jsonParsed);
        } catch (error) {
            console.error("Error getting sorted JSON:", error);
            setJsonContentSorted(undefined);
        }
    }, []);

    const onFileChangeUnsorted = useCallback(async (file: File | undefined) => {
        if (!file) {
            setJsonContentUnsorted(undefined);

            return;
        }

        try {
            const jsonData = await file.text();
            const jsonParsed = JSON.parse(jsonData);
            setJsonContentUnsorted(jsonParsed);
        } catch (error) {
            console.error("Error getting sorted JSON:", error);
            setJsonContentUnsorted(undefined);
        }
    }, []);

    console.debug("Unsorted JSON:", jsonContentUnsorted);
    console.debug("Sorted JSON:", jsonContentSorted);
    return (
        <div>
            <ButtonContainer>
                <div>
                    <p>Upload unsorted :</p>
                    <ImportFile id="upload-unsorted" onFileChange={onFileChangeUnsorted} />
                </div>
                <div>
                    <p>Upload sorted :</p>
                    <ImportFile id="upload-sorted" onFileChange={onFileChangeSorted} />
                </div>
            </ButtonContainer>

            <JsonDisplay>
                <JsonContainer>
                    <strong>Unsorted JSON :</strong>
                    <pre>
                        {jsonContentUnsorted
                            ? JSON.stringify(jsonContentUnsorted, null, 2)
                            : "No file uploaded or invalid JSON."}
                    </pre>
                </JsonContainer>

                <JsonContainer>
                    <strong>Comparison</strong>
                </JsonContainer>

                <JsonContainer>
                    <strong>Sorted JSON :</strong>
                    <pre>
                        {jsonContentSorted
                            ? JSON.stringify(jsonContentSorted, null, 2)
                            : "No file uploaded or invalid JSON."}
                    </pre>
                </JsonContainer>
            </JsonDisplay>
        </div>
    );
};

export default Comparator;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 2rem 4rem;
`;

const JsonDisplay = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 2rem;
`;

const JsonContainer = styled.div`
    flex: 1;
    margin: 1rem;
    padding: 1rem;
    background-color: #fafafa;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: auto;
    min-height: 300px;
    max-height: 500px;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: monospace;
`;
