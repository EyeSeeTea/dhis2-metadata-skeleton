import { OpType } from "$/webapp/components/comparator/ComparatorViewModel";
import { DiffLineProps, useDiffLineProps } from "$/webapp/components/comparator/useDiffLineProps";
import { AddCircleOutline, CachedOutlined, RemoveCircleOutline } from "@material-ui/icons";
import styled from "styled-components";

export function DiffLine(props: DiffLineProps) {
    const {
        colors: { selectedLineColor, selectedBackgroundColor, selectedButtonTextColor },
        isPathModified,
        lineButtonText,
        operationType,
        toggleChoice,
        updateSelection,
    } = useDiffLineProps(props);

    return (
        <LineContainer>
            <SelectedLineIndicator color={selectedLineColor} />
            <code style={{ whiteSpace: "pre-wrap" }}>{props.line.text}</code>
            {isPathModified && operationType && (
                <StyledOpIconButton
                    onClick={toggleChoice}
                    title={`${lineButtonText}`}
                    aria-label={`${operationType} at ${props.line.path}`}
                >
                    <OpIcon opType={operationType} />
                </StyledOpIconButton>
            )}
            {isPathModified && (
                <StyledButton
                    onClick={updateSelection}
                    background={selectedBackgroundColor}
                    color={selectedButtonTextColor}
                >
                    {lineButtonText}
                </StyledButton>
            )}
        </LineContainer>
    );
}

const OpIcon = ({ opType }: { opType: OpType }) => {
    switch (opType) {
        case "add":
            return <AddCircleOutline htmlColor={"#10b981"} fontSize={"small"} />;
        case "remove":
            return <RemoveCircleOutline htmlColor={"#ef4444"} fontSize={"small"} />;
        case "replace":
            return <CachedOutlined htmlColor={"#3b82f6"} fontSize={"small"} />;
        default: {
            console.warn(`No icon for op type: ${opType}`);
            return null;
        }
    }
};

const LineContainer = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
`;

const SelectedLineIndicator = styled.div<{ color: string }>`
    width: 6px;
    height: 16px;
    background: ${props => props.color};
    border-radius: 3px;
`;

const StyledButton = styled.button<{ background: string; color: string }>`
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: ${props => props.background};
    color: ${props => props.color};
    cursor: pointer;
`;

const StyledOpIconButton = styled.button`
    display: inline-flex;
    align-items: center;
    border: none;
    background: transparent;
    padding: 2px;
    cursor: pointer;
`;
