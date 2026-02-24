import styled from "styled-components";
import { DiffEditor, Editor } from "@monaco-editor/react";
import ActionButton from "$/webapp/components/ActionButton";
import i18n from "$/utils/i18n";
import { ChevronLeft, ChevronRight, CloudDownload } from "@material-ui/icons";
import { useDownloadJSON } from "$/webapp/components/comparator/hooks/useDownloadJSON";
import { useJsonDiffSelector } from "$/webapp/components/comparator/hooks/useJsonDiffSelector";
import { ComparatorState } from "$/webapp/components/comparator/hooks/useComparator";
import { EditorPane } from "$/webapp/components/comparator/Comparator";

type DiffSectionProps = Omit<
    ComparatorState,
    "uploadLeft" | "uploadRight" | "hideLeftButton" | "hideRightButton"
>;

export default function DiffSection(props: DiffSectionProps) {
    const {
        leftText,
        rightText,
        mergedText,
        mergedJson,
        acceptLeft,
        acceptRight,
        handleMergedChange,
        applyMergedJson,
    } = props;

    const { downloadJSON: downloadMerged } = useDownloadJSON(mergedJson);
    const { jsonDiffs, selectedChanges, handleChangeSelection, getChangePreview } =
        useJsonDiffSelector(leftText, rightText, applyMergedJson);

    return (
        <Container>
            <DiffEditorPane>
                <DiffEditor
                    language="json"
                    original={leftText}
                    modified={rightText}
                    options={{
                        enableSplitViewResizing: true,
                        minimap: { enabled: true },
                        fontSize: 12,
                        wordWrap: "on",
                        formatOnPaste: true,
                        formatOnType: true,
                    }}
                />
            </DiffEditorPane>

            <MergeControls>
                <ActionButton
                    onClick={acceptLeft}
                    label={i18n.t("Accept file 1")}
                    startIcon={<ChevronLeft />}
                />
                <ActionButton
                    onClick={acceptRight}
                    label={i18n.t("Accept file 2")}
                    endIcon={<ChevronRight />}
                />
            </MergeControls>

            <DownloadButton>
                <ActionButton
                    onClick={downloadMerged}
                    disabled={!mergedText}
                    label={i18n.t("Download Merged")}
                    startIcon={<CloudDownload />}
                />
            </DownloadButton>

            <DiffWithControls>
                <EditorPane label={i18n.t("Merged Result")}>
                    <Editor
                        width={"100%"}
                        language="json"
                        value={mergedText}
                        onChange={handleMergedChange}
                        options={{
                            readOnly: false,
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            fontSize: 12,
                            wordWrap: "on",
                            formatOnPaste: true,
                            formatOnType: true,
                        }}
                    />
                </EditorPane>
                <ChangeControls>
                    <ChangeControlsTitle>
                        {i18n.t("Select Changes")} ({jsonDiffs.length})
                    </ChangeControlsTitle>
                    <ChangeList>
                        {jsonDiffs.map(diff => {
                            const { leftPreview, rightPreview } = getChangePreview(diff);
                            return (
                                <ChangeItem key={diff.path}>
                                    <ChangeInfo>
                                        <PathLabel>{diff.path}</PathLabel>
                                        <ChangeType type={diff.type}>{diff.type}</ChangeType>
                                    </ChangeInfo>
                                    <ValuePreviews>
                                        <ValuePreview>
                                            <ValueLabel>Left:</ValueLabel>
                                            <ValueText>{leftPreview}</ValueText>
                                        </ValuePreview>
                                        <ValuePreview>
                                            <ValueLabel>Right:</ValueLabel>
                                            <ValueText>{rightPreview}</ValueText>
                                        </ValuePreview>
                                    </ValuePreviews>
                                    <ChangeButtons>
                                        <SelectButton
                                            active={selectedChanges[diff.path] === "left"}
                                            onClick={() => handleChangeSelection(diff.path, "left")}
                                        >
                                            ← Use Left
                                        </SelectButton>
                                        <SelectButton
                                            active={selectedChanges[diff.path] === "right"}
                                            onClick={() =>
                                                handleChangeSelection(diff.path, "right")
                                            }
                                        >
                                            Use Right →
                                        </SelectButton>
                                    </ChangeButtons>
                                </ChangeItem>
                            );
                        })}
                    </ChangeList>
                </ChangeControls>
            </DiffWithControls>
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-block: 2rem 3.5rem;
`;

const DiffEditorPane = styled.div`
    display: flex;
    flex-direction: column;
    height: 75vh;
    width: 100%;
    margin-block-end: 0.5rem;

    .editor {
        border: 1.5px solid ${props => props.theme.palette.divider};
        padding: 1rem;
        border-radius: 8px;
    }
`;

const MergeControls = styled.div`
    display: flex;
    justify-content: space-between;
    margin-block: 0.5rem 1rem;
`;

const DownloadButton = styled.div`
    margin-inline-start: auto;
`;

const DiffWithControls = styled.div`
    display: flex;
    gap: 2rem;
    height: 75vh;
`;

const ChangeControls = styled.div`
    width: 22.5%;
    padding: 1rem;
    overflow-y: auto;
    border: 1.5px solid ${props => props.theme.palette.divider};
    height: 100%;
`;

const ChangeControlsTitle = styled.h4`
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
`;

const ChangeList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const ChangeItem = styled.div`
    border-radius: 4px;
    padding: 0.75rem;
    border-inline-start: 3px solid ${props => props.theme.palette.primary.dark};
    box-shadow: 2px 4px 6px ${props => props.theme.palette.shadow};
`;

const ChangeInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-block-end: 0.5rem;
`;

const PathLabel = styled.span`
    color: ${props => props.theme.palette.text.primary};
    font-size: 0.9rem;
    font-family: monospace;
    word-break: break-all;
`;

const ValuePreviews = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0.5rem 0;
    padding: 0.5rem;
    background-color: ${props => props.theme.palette.action.active};
    border-radius: 3px;
`;

const ValuePreview = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ValueLabel = styled.span`
    color: ${props => props.theme.palette.text.hint};
    font-size: 0.7rem;
    font-weight: 600;
    min-width: 35px;
`;

const ValueText = styled.span`
    color: ${props => props.theme.palette.common.white};
    font-size: 0.7rem;
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ChangeType = styled.span<{ type: string }>`
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    background-color: ${props =>
        props.type === "added"
            ? props.theme.palette.status.positive
            : props.type === "removed"
            ? props.theme.palette.status.negative
            : props.theme.palette.status.warning};
    color: white;
    text-transform: uppercase;
`;

const ChangeButtons = styled.div`
    display: flex;
    gap: 0.25rem;
`;

const SelectButton = styled.button<{ active: boolean }>`
    flex: 1;
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    background-color: ${props =>
        props.active ? props.theme.palette.primary.main : props.theme.palette.action.active};
    color: ${props => props.theme.palette.common.white};
    transition: all 0.2s;

    &:hover {
        background-color: ${props =>
            props.active ? props.theme.palette.primary.dark : props.theme.palette.action.disabled};
    }
`;
