import { JSONContent } from "$/domain/entities/JSONContent";
import i18n from "$/utils/i18n";
import { Maybe } from "$/utils/ts-utils";
import { JsonContainer, Title } from "$/webapp/components/comparator/Comparator";
import { Choice, Line, renderValue, Row } from "$/webapp/components/comparator/ComparatorViewModel";
import { DiffLine } from "$/webapp/components/comparator/DiffLine";
import { useMemo } from "react";
import styled from "styled-components";

export type DiffViewerProps = {
    jsonContent: Maybe<JSONContent>;
    label: string;
    mergedSelection: Record<string, Choice>;
    rows: Row[];
    side: Choice;
    updateChoice: (path: string, choice: Choice) => void;
};

export function DiffViewer(props: DiffViewerProps) {
    const { label, jsonContent } = props;
    const lines = useMemo(() => (jsonContent ? jsonToLines(jsonContent, "  ") : []), [jsonContent]);

    return (
        <JsonContainer>
            <Title>{i18n.t(label)}</Title>

            <StyledContainer>
                <StyledDiv>
                    {lines.map((_, i) => (
                        <StyledIndex key={i}>{i + 1}</StyledIndex>
                    ))}
                </StyledDiv>
                <StyledDiv>
                    {lines.map((line, index) => (
                        <DiffLine key={index} line={line} {...props} />
                    ))}
                </StyledDiv>
            </StyledContainer>
        </JsonContainer>
    );
}

const jsonToLines = (jsonContent: JSONContent, unit: string): Line[] =>
    renderValue({ jsonValue: jsonContent, path: "", depth: 0, isLast: true, unit });

const StyledContainer = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: start;
`;

const StyledDiv = styled.div`
    padding: 8px;
`;

const StyledIndex = styled.div`
    height: 19px;
    color: #9ca3af;
    text-align: right;
`;
