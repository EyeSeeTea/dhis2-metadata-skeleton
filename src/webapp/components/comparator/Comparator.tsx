import { ImportFile } from "$/webapp/components/import-file/ImportFile";
import React from "react";
import { styled } from "styled-components";
import _ from "../../../domain/entities/generic/Collection";
import { useJSONDifference } from "$/webapp/components/comparator/useJSONFDifference";

export const Comparator: React.FC = () => {
    const { jsonContentSorted, jsonContentUnsorted, jsonDifference, uploadSorted, uploadUnsorted } =
        useJSONDifference();

    return (
        <div>
            <ButtonContainer>
                <div>
                    <p>Upload unsorted:</p>
                    <ImportFile id="upload-unsorted" onFileChange={uploadUnsorted} />
                </div>
                <div>
                    <p>Upload sorted:</p>
                    <ImportFile id="upload-sorted" onFileChange={uploadSorted} />
                </div>
            </ButtonContainer>

            <JsonDisplay>
                <JsonContainer>
                    <strong>Unsorted JSON:</strong>
                    <pre>
                        {jsonContentUnsorted
                            ? JSON.stringify(jsonContentUnsorted, null, 2)
                            : "No file uploaded or invalid JSON."}
                    </pre>
                </JsonContainer>

                <JsonContainer>
                    <strong>Difference:</strong>
                    <pre>{jsonDifference}</pre>
                </JsonContainer>

                <JsonContainer>
                    <strong>Sorted JSON:</strong>
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
