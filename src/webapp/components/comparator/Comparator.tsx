import { Editor } from "@monaco-editor/react";
import styled from "styled-components";
import Split from "react-split";
import { useComparator } from "$/webapp/components/comparator/hooks/useComparator";
import { ImportFile } from "$/webapp/components/import-file/ImportFile";
import i18n from "$/utils/i18n";
import DiffSection from "$/webapp/components/comparator/DiffSection";

export const EditorPane = (props: { children: React.ReactNode; label?: string }) => {
    const { children, label } = props;

    return (
        <EditorWrapper>
            <p>{label}</p>
            {children}
        </EditorWrapper>
    );
};

export default function Comparator() {
    const {
        leftText,
        rightText,
        mergedText,
        hideLeftButton,
        hideRightButton,
        uploadLeft,
        uploadRight,
        ...comparatorState
    } = useComparator();

    return (
        <Container>
            <UploadGroup>
                {!hideLeftButton && (
                    <ImportFile
                        id="upload-file-1"
                        label={i18n.t("Upload File 1")}
                        onFileChange={uploadLeft}
                    />
                )}

                {!hideRightButton && (
                    <ImportFile
                        id="upload-file-2"
                        label={i18n.t("Upload File 2")}
                        onFileChange={uploadRight}
                    />
                )}
            </UploadGroup>

            {leftText && rightText && mergedText ? (
                <DiffSection
                    {...comparatorState}
                    leftText={leftText}
                    rightText={rightText}
                    mergedText={mergedText}
                />
            ) : (
                <EditorContainer>
                    <Split
                        sizes={[50, 50]}
                        minSize={200}
                        gutterSize={15}
                        direction="horizontal"
                        cursor="col-resize"
                        className="split-container"
                    >
                        <EditorPane label="File 1">
                            <Editor
                                language="json"
                                value={leftText}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: true },
                                    scrollBeyondLastLine: false,
                                    fontSize: 12,
                                    wordWrap: "on",
                                    formatOnPaste: true,
                                    formatOnType: true,
                                }}
                            />
                        </EditorPane>

                        <EditorPane label="File 2">
                            <Editor
                                language="json"
                                value={rightText}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: true },
                                    scrollBeyondLastLine: false,
                                    fontSize: 12,
                                    wordWrap: "on",
                                    formatOnPaste: true,
                                    formatOnType: true,
                                }}
                            />
                        </EditorPane>
                    </Split>
                </EditorContainer>
            )}
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: 3rem;
`;

const UploadGroup = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const EditorContainer = styled.div`
    flex: 1;
    overflow: hidden;
    margin-block: 2rem;

    .split-container {
        display: flex;
        height: 100%;
    }

    .gutter:hover {
        background-color: ${props => props.theme.palette.background.grey};
    }

    .gutter.gutter-horizontal {
        cursor: col-resize;
    }

    .gutter.gutter-vertical {
        cursor: row-resize;
    }
`;

const EditorWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 75vh;
    width: 75%;
    border: 1.5px solid ${props => props.theme.palette.divider};
    padding: 0.5rem 1rem;
    border-radius: 8px;

    p {
        margin: 0;
        margin-block-end: 0.5rem;
        font-size: 0.75rem;
        font-family: monospace;
        color: ${props => props.theme.palette.text.secondary};
    }
`;
