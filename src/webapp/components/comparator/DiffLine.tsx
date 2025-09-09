import i18n from "$/utils/i18n";
import { Choice, Line } from "$/webapp/components/comparator/ComparatorViewModel";
import { DiffViewerProps } from "$/webapp/components/comparator/DiffViewer";
import { useCallback, useMemo } from "react";
import styled from "styled-components";
import { Operation } from "fast-json-patch";

type DiffLineProps = DiffViewerProps & { line: Line };

type DiffLineState = {
    colors: {
        selectedLineColor: string;
        selectedBackgroundColor: string;
        selectedButtonTextColor: string;
    };
    isPathModified: boolean;
    lineButtonText: string;
    updateSelection: () => void;
};

type OpKind = Operation["op"];

const colorFor = (kind: OpKind): string =>
    kind === "add"
        ? "#10b981"
        : kind === "remove"
        ? "#ef4444"
        : kind === "replace"
        ? "#3b82f6"
        : "#9ca3af";

const titleFor = (kind: OpKind, side: Choice): string =>
    kind === "add"
        ? side === "unsorted"
            ? "added"
            : "added in B"
        : kind === "remove"
        ? side === "unsorted"
            ? "removed"
            : "removed in B"
        : kind === "replace"
        ? "replaced"
        : kind;

const OpIcon = ({ kind }: { kind: OpKind }) =>
    kind === "add" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill={colorFor(kind)} opacity="0.15" />
            <path
                d="M12 7v10M7 12h10"
                stroke={colorFor(kind)}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    ) : kind === "remove" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill={colorFor(kind)} opacity="0.15" />
            <path d="M7 12h10" stroke={colorFor(kind)} strokeWidth="2" strokeLinecap="round" />
        </svg>
    ) : kind === "replace" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill={colorFor(kind)} opacity="0.15" />
            <path
                d="M8 12h8M12 8v8"
                stroke={colorFor(kind)}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    ) : (
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <circle cx="5" cy="5" r="4" fill="#9ca3af" />
        </svg>
    );

export function DiffLine(props: DiffLineProps) {
    const {
        isPathModified,
        lineButtonText,
        colors: { selectedLineColor, selectedBackgroundColor, selectedButtonTextColor },
        updateSelection,
    } = useDiffLineProps(props);

    return (
        <LineContainer>
            <SelectedLineIndicator color={selectedLineColor} />
            <code style={{ whiteSpace: "pre-wrap" }}>{props.line.text}</code>
            {isPathModified ? (
                <StyledButton
                    onClick={updateSelection}
                    background={selectedBackgroundColor}
                    color={selectedButtonTextColor}
                >
                    {lineButtonText}
                </StyledButton>
            ) : null}
        </LineContainer>
    );
}

function useDiffLineProps(props: DiffLineProps): DiffLineState {
    const {
        line: { path },
        rows,
        mergedSelection,
        side,
        updateChoice,
    } = props;

    const changed = path ? rows.some(row => row.path === path) : false;
    const chosenSide = path ? mergedSelection[path] : undefined;
    const isSelectedSide = chosenSide === side;

    const selectedLineColor = changed ? (isSelectedSide ? "#c7f3d0" : "#fde68a") : "transparent";
    const selectedBackgroundColor = isSelectedSide ? "#10b981" : "white";
    const selectedButtonTextColor = isSelectedSide ? "white" : "black";

    const lineButtonText = getButtonText(side, isSelectedSide);
    const isPathModified = useMemo(() => changed && path !== undefined, [changed, path]);
    const updateSelection = useCallback(() => {
        if (path) updateChoice(path, side);
    }, [path, side, updateChoice]);

    return {
        colors: {
            selectedLineColor: selectedLineColor,
            selectedBackgroundColor: selectedBackgroundColor,
            selectedButtonTextColor: selectedButtonTextColor,
        },
        isPathModified: isPathModified,
        lineButtonText: lineButtonText,
        updateSelection: updateSelection,
    };
}

function getButtonText(side: Choice, chosenHere: boolean): string {
    switch (side) {
        case "sorted": {
            return chosenHere ? i18n.t("Using A") : i18n.t("Use A");
        }
        case "unsorted": {
            return chosenHere ? i18n.t("Using B") : i18n.t("Use B");
        }
    }
}

const LineContainer = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
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
