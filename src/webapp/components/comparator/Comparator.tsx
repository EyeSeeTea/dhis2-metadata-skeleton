import { ImportFile } from "$/webapp/components/import-file/ImportFile";
import React from "react";
import { styled } from "styled-components";
import { useJSONDifference } from "$/webapp/components/comparator/useJSONDifference";
import { Maybe } from "$/utils/ts-utils";

export const Comparator: React.FC = () => {
    const {
        hideSortedButton,
        hideUnsortedButton,
        jsonContentSorted,
        jsonContentUnsorted,
        jsonDifference,
        uploadSorted,
        uploadUnsorted,
    } = useJSONDifference();

    return (
        <>
            <ButtonContainer>
                <UploadButton
                    left
                    hidden={hideUnsortedButton}
                    title="Upload unsorted"
                    onFileChange={uploadUnsorted}
                />

                <UploadButton
                    right
                    hidden={hideSortedButton}
                    title="Upload sorted"
                    onFileChange={uploadSorted}
                />
            </ButtonContainer>

            <JsonDisplay>
                <JsonContainer>
                    <strong>Unsorted JSON:</strong>
                    <pre>
                        {jsonContentUnsorted
                            ? JSON.stringify(jsonContentUnsorted, null, 2)
                            : "No file uploaded."}
                    </pre>
                </JsonContainer>

                <JsonContainer>
                    <strong>Difference:</strong>
                    <pre>{jsonDifference.join("\n")}</pre>
                </JsonContainer>

                <JsonContainer>
                    <strong>Sorted JSON:</strong>
                    <pre>
                        {jsonContentSorted
                            ? JSON.stringify(jsonContentSorted, null, 2)
                            : "No file uploaded."}
                    </pre>
                </JsonContainer>
            </JsonDisplay>
        </>
    );
};

export default Comparator;

const UploadButton: React.FC<{
    hidden: boolean;
    title: string;
    left?: boolean;
    right?: boolean;
    onFileChange: (file: Maybe<File>) => void;
}> = ({ hidden, title, left, right, onFileChange }) => {
    return (
        <ButtonWithHiddenProp hidden={hidden} left={left} right={right}>
            {title && <p>{title}</p>}
            <ImportFile id={`upload-${title.toLowerCase()}`} onFileChange={onFileChange} />
        </ButtonWithHiddenProp>
    );
};

const ButtonWithHiddenProp = styled.div<{ hidden: boolean; left?: boolean; right?: boolean }>`
    opacity: ${props => (props.hidden ? 0 : 1)};
    position: absolute;
    left: ${props => (props.left ? "0" : "auto")};
    right: ${props => (props.right ? "0" : "auto")};
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    position: relative;
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
    margin-top: 6rem;
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
