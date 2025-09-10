import { useComparator } from "$/webapp/components/comparator/hooks/useComparator";
import { ImportFile } from "$/webapp/components/import-file/ImportFile";
import styled from "styled-components";
import { useDownloadJSON } from "$/webapp/components/comparator/hooks/useDownloadJSON";
import { CloudDownload } from "@material-ui/icons";
import i18n from "$/utils/i18n";
import ActionButton from "$/webapp/components/ActionButton";
import { DiffViewer } from "$/webapp/components/comparator/DiffViewer";
import { prettyPrintJson } from "$/webapp/components/comparator/ComparatorViewModel";

export default function Comparator() {
    const {
        choiceCounts,
        mergedJSON,
        mergedSelection,
        rows,
        sortedMetadata,
        unsortedMetadata,
        updateChoice,
    } = useComparator();
    const { downloadJSON: downloadMerged } = useDownloadJSON(mergedJSON);

    return (
        <Container>
            <ButtonContainer>
                {!sortedMetadata.hideButton && (
                    <div>
                        <span>{i18n.t("Upload sorted")}</span>
                        <ImportFile id="upload-sorted" onFileChange={sortedMetadata.upload} />
                    </div>
                )}

                {!unsortedMetadata.hideButton && (
                    <RightAlignContainer>
                        <span>{i18n.t("Upload unsorted")}</span>
                        <ImportFile id="upload-unsorted" onFileChange={unsortedMetadata.upload} />
                    </RightAlignContainer>
                )}
            </ButtonContainer>

            <JsonDisplay>
                <DiffViewer
                    label="Sorted JSON"
                    jsonContent={sortedMetadata.jsonContent}
                    side="sorted"
                    rows={rows}
                    mergedSelection={mergedSelection}
                    updateChoice={updateChoice}
                />
                <DiffViewer
                    label="Unsorted JSON"
                    jsonContent={unsortedMetadata.jsonContent}
                    side="unsorted"
                    rows={rows}
                    mergedSelection={mergedSelection}
                    updateChoice={updateChoice}
                />
            </JsonDisplay>

            <MergedPreviewContainer>
                <StyledDiv>
                    <ButtonContainer>
                        <StyledSpan>{i18n.t(`Diffs: ${rows.length}`)}</StyledSpan>
                        <StyledSpan>{i18n.t(`Chosen A: ${choiceCounts.sorted}`)}</StyledSpan>
                        <StyledSpan>{i18n.t(`Chosen B: ${choiceCounts.unsorted}`)}</StyledSpan>
                    </ButtonContainer>
                    {mergedJSON && (
                        <ActionButton
                            onClick={downloadMerged}
                            disabled={!mergedJSON}
                            label="Download merged.json"
                            icon={<CloudDownload />}
                        />
                    )}
                </StyledDiv>
                <JsonContainer>
                    <Title>Merged Preview:</Title>
                    <pre>
                        {mergedJSON ? prettyPrintJson(mergedJSON) : "No merged content available."}
                    </pre>
                </JsonContainer>
            </MergedPreviewContainer>
        </Container>
    );
}

const Container = styled.div`
    margin: 2rem;
`;

export const Title = styled.p`
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 0.4rem;
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const JsonDisplay = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 2rem;
`;

export const JsonContainer = styled.div`
    flex: 1;
    margin: 2rem 1rem 1rem 0;
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
    font-size: 12px;
`;

const MergedPreviewContainer = styled.section`
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
`;

const RightAlignContainer = styled.div`
    margin-left: auto;
`;

const StyledSpan = styled.span`
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    border-radius: 1.25rem;
    font-size: 0.75rem;
`;

const StyledDiv = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;
