import React, { useMemo, useState, useEffect } from "react";
import { compare as diff, applyPatch, type Operation } from "fast-json-patch";
import { useJSONComparator } from "$/webapp/components/comparator/useJSONComparator";
import { JSONContent } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import { ImportFile } from "$/webapp/components/import-file/ImportFile";
import styled from "styled-components";
import { useDownloadJSON } from "$/webapp/components/comparator/useDownloadJSON";
import { Button as MUIButton } from "@material-ui/core";
import { CloudDownload } from "@material-ui/icons";
import i18n from "$/utils/i18n";

// Users upload exactly two files: A and B. We compute A→B diff rows,
// and the user picks per-path whether the merged result keeps A or takes B.
type Choice = "a" | "b";

type Row = {
    path: string;
    op: Operation; // op that turns A into B at this path
    aValue: JSONContent | undefined;
    bValue: JSONContent | undefined; // undefined if B removed the value
};

// ---------- JSON Pointer helpers ----------
const pathToArray = (p: string): string[] => p.split("/").slice(1).map(decodeURIComponent);
const getAt = (obj: unknown, jptr: string): JSONContent | undefined =>
    pathToArray(jptr).reduce<any>((acc, k) => acc?.[k], obj as any);

// ---------- Patch helpers ----------
const applyOps = (base: JSONContent, ops: Operation[]): JSONContent => {
    const ordered = [...ops].sort(
        (a, b) => pathToArray(a.path).length - pathToArray(b.path).length
    );
    const clone = (x: JSONContent) => JSON.parse(JSON.stringify(x)) as JSONContent;
    return applyPatch(clone(base), ordered, false).newDocument as JSONContent;
};

// Build A→B rows for the GUI
const buildRows = (a: JSONContent, b: JSONContent): Row[] =>
    diff(a, b)
        .map(operation => ({
            path: operation.path,
            op: operation,
            aValue: getAt(a, operation.path),
            bValue: operation.op === "replace" ? operation.value : undefined,
        }))
        .sort((r1, r2) => r1.path.localeCompare(r2.path));

const pretty = (json: JSONContent): string => {
    try {
        return JSON.stringify(json, null, 2);
    } catch {
        return String(json);
    }
};

const SelectionRow = ({
    path,
    aValue,
    bValue,
    choice,
    onChoose,
}: {
    path: string;
    aValue: Maybe<JSONContent>;
    bValue: Maybe<JSONContent>;
    choice: Choice;
    onChoose: (c: Choice) => void;
}) => (
    <SelectionRowGrid>
        <SelectionPathCell>
            <SelectionPath>{path}</SelectionPath>
            <SelectionChoices>
                <label>
                    <input
                        type="radio"
                        name={`sel-${path}`}
                        checked={choice === "a"}
                        onChange={() => onChoose("a")}
                    />{" "}
                    Use A
                </label>
                <label>
                    <input
                        type="radio"
                        name={`sel-${path}`}
                        checked={choice === "b"}
                        onChange={() => onChoose("b")}
                    />{" "}
                    Use B
                </label>
            </SelectionChoices>
        </SelectionPathCell>
        <SelectionValueCell>
            <SelectionPre>{aValue ? pretty(aValue) : "No value"}</SelectionPre>
        </SelectionValueCell>
        <SelectionValueCell>
            <SelectionPre>{bValue ? pretty(bValue) : "No value"}</SelectionPre>
        </SelectionValueCell>
    </SelectionRowGrid>
);

const SelectionRowGrid = styled.div`
    display: grid;
    grid-template-columns: 240px 1fr 1fr;
    border-top: 1px solid #eee;
`;

const SelectionPathCell = styled.div`
    padding: 0.5rem;
`;

const SelectionPath = styled.div`
    font-size: 12px;
    font-family: monospace;
    color: #6b7280;
    margin-bottom: 0.25rem;
    word-break: break-all;
`;

const SelectionChoices = styled.div`
    font-size: 12px;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    label {
        user-select: none;
        cursor: pointer;
    }

    input {
        margin-right: 0.25rem;
        cursor: pointer;
    }
`;

const SelectionValueCell = styled.div`
    padding: 0.5rem;
    border-left: 1px solid #eee;
    background-color: #fafafa;
    max-height: 200px;
    overflow: auto;
`;

const SelectionPre = styled.pre`
    margin: 0;
    white-space: pre-wrap;
    font-family: monospace;
    padding: 8px;
    border-radius: 8px;
`;

export default function Comparator() {
    const { sortedMetadata, unsortedMetadata, uploadSorted, uploadUnsorted } = useJSONComparator();

    // Per-path selection (default to keeping A)
    const [choices, setChoices] = useState<Record<string, Choice>>({});

    // Build rows whenever both sides are valid
    const rows = useMemo(
        () =>
            sortedMetadata.jsonContent && unsortedMetadata.jsonContent
                ? buildRows(sortedMetadata.jsonContent, unsortedMetadata.jsonContent)
                : [],
        [sortedMetadata.jsonContent, unsortedMetadata.jsonContent]
    );

    useEffect(() => {
        const def = rows.reduce<Record<string, Choice>>(
            (acc, r) => ({ ...acc, [r.path]: acc[r.path] ?? "a" }),
            {}
        );
        setChoices(def);
    }, [rows.map(r => r.path).join("|")]);

    const chosenOps = useMemo(
        () => rows.filter(r => choices[r.path] === "b").map(r => r.op),
        [rows, choices]
    );

    const mergedJSON = useMemo(
        () =>
            sortedMetadata.jsonContent
                ? applyOps(sortedMetadata.jsonContent, chosenOps)
                : undefined,
        [sortedMetadata.jsonContent, chosenOps]
    );

    const { downloadJSON: downloadMerged } = useDownloadJSON(mergedJSON);

    const counts = useMemo(
        () =>
            Object.values(choices).reduce((acc, c) => ({ ...acc, [c]: acc[c] + 1 }), {
                a: 0,
                b: 0,
            } as Record<Choice, number>),
        [choices]
    );

    return (
        <Container>
            <ButtonContainer>
                {!sortedMetadata.hideButton && (
                    <div>
                        <span>{i18n.t("Upload sorted")}</span>
                        <ImportFile id="upload-sorted" onFileChange={uploadSorted} />
                    </div>
                )}

                {!unsortedMetadata.hideButton && (
                    <RightAlignContainer>
                        <span>{i18n.t("Upload unsorted")}</span>
                        <ImportFile id="upload-unsorted" onFileChange={uploadUnsorted} />
                    </RightAlignContainer>
                )}
            </ButtonContainer>

            <JsonDisplay>
                <JsonContainer>
                    <Title>Sorted JSON:</Title>
                    <pre>
                        {sortedMetadata.jsonContent
                            ? pretty(sortedMetadata.jsonContent)
                            : "No file uploaded."}
                    </pre>
                </JsonContainer>

                <JsonContainer>
                    <Title>Unsorted JSON:</Title>
                    <pre>
                        {unsortedMetadata.jsonContent
                            ? pretty(unsortedMetadata.jsonContent)
                            : "No file uploaded."}
                    </pre>
                </JsonContainer>
            </JsonDisplay>

            <MergedPreviewContainer>
                <RightAlignContainer>
                    {mergedJSON && (
                        <ActionButton
                            onClick={downloadMerged}
                            disabled={!mergedJSON}
                            label="Download merged.json"
                            icon={<CloudDownload />}
                        />
                    )}
                </RightAlignContainer>

                <JsonContainer>
                    <Title>Merged Preview:</Title>
                    <pre>{mergedJSON ? pretty(mergedJSON) : "No merged content available."}</pre>
                </JsonContainer>
            </MergedPreviewContainer>

            <section style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
                <span
                    style={{
                        padding: "4px 8px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 999,
                        fontSize: 12,
                    }}
                >
                    Diffs: {rows.length}
                </span>
                <span
                    style={{
                        padding: "4px 8px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 999,
                        fontSize: 12,
                    }}
                >
                    Chosen A: {counts.a}
                </span>
                <span
                    style={{
                        padding: "4px 8px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 999,
                        fontSize: 12,
                    }}
                >
                    Chosen B: {counts.b}
                </span>
            </section>

            <section>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "240px 1fr 1fr",
                        gap: 0,
                        padding: 8,
                        background: "#f9fafb",
                        border: "1px solid #eee",
                        borderRadius: "12px 12px 0 0",
                        fontWeight: 600,
                        fontSize: 12,
                    }}
                >
                    <div>Path & Choice</div>
                    <div>File A</div>
                    <div>File B</div>
                </div>
                <div
                    style={{
                        border: "1px solid #eee",
                        borderTop: "none",
                        borderRadius: "0 0 12px 12px",
                    }}
                >
                    {rows.length === 0 ? (
                        <div style={{ padding: 12, color: "#6b7280" }}>
                            No differences detected.
                        </div>
                    ) : (
                        rows.map(row => (
                            <SelectionRow
                                key={row.path}
                                path={row.path}
                                aValue={row.aValue}
                                bValue={row.bValue}
                                choice={choices[row.path] ?? "a"}
                                onChoose={choice =>
                                    setChoices(prev => ({ ...prev, [row.path]: choice }))
                                }
                            />
                        ))
                    )}
                </div>
            </section>
        </Container>
    );
}

const ActionButton: React.FC<{
    children?: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
    label: string;
    onClick?: () => void;
}> = ({ children, disabled, icon, label, onClick }) => {
    return (
        <MUIButton
            variant="contained"
            color="primary"
            onClick={onClick}
            disabled={disabled}
            startIcon={icon}
            style={{ marginLeft: "auto", textTransform: "none" }}
        >
            {i18n.t(label)}
            {children}
        </MUIButton>
    );
};

const Container = styled.div`
    margin: 2rem;
`;

const Title = styled.p`
    font-weight: bold;
    margin-bottom: 0.4rem;
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
`;

const JsonDisplay = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;
    position: relative;
`;

const JsonContainer = styled.div`
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
`;

const MergedPreviewContainer = styled.section`
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
`;

const RightAlignContainer = styled.div`
    margin-left: auto;
`;
