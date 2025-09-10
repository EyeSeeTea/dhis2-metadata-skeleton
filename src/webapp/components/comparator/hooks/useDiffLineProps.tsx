import i18n from "$/utils/i18n";
import { Maybe } from "$/utils/ts-utils";
import { Choice, Line, OpType } from "$/webapp/components/comparator/ComparatorViewModel";
import { DiffViewerProps } from "$/webapp/components/comparator/DiffViewer";
import { useCallback, useMemo } from "react";

export type DiffLineProps = DiffViewerProps & { line: Line };

type DiffLineState = {
    colors: {
        selectedLineColor: string;
        selectedBackgroundColor: string;
        selectedButtonTextColor: string;
    };
    isPathModified: boolean;
    lineButtonText: string;
    operationType: Maybe<OpType>;
    updateSelection: () => void;
    toggleChoice: () => void;
};

export function useDiffLineProps(props: DiffLineProps): DiffLineState {
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

    const selectedLineColor = changed
        ? isSelectedSide
            ? colors.SELECTED_LINE_COLOR
            : colors.UNSELECTED_LINE_COLOR
        : colors.TRANSPARENT;
    const selectedBackgroundColor = isSelectedSide
        ? colors.SELECTED_BACKGROUND_COLOR
        : colors.WHITE;
    const selectedButtonTextColor = isSelectedSide ? colors.WHITE : colors.BLACK;

    const opKindByPath = useMemo<Record<string, OpType>>(
        () =>
            rows.reduce<Record<string, OpType>>(
                (acc, r) => ({ ...acc, [r.path]: r.op.op as OpType }),
                {}
            ),
        [rows]
    );

    const operationType = useMemo(
        () => (path ? opKindByPath[path] : undefined),
        [path, opKindByPath]
    );
    const lineButtonText = useMemo(
        () => getButtonText(side, isSelectedSide),
        [side, isSelectedSide]
    );
    const isPathModified = useMemo(() => changed && path !== undefined, [changed, path]);

    const toggleChoice = useCallback(() => {
        if (path)
            updateChoice(
                path,
                mergedSelection[path] === Choice.UNSORTED ? Choice.SORTED : Choice.UNSORTED
            );
    }, [path, mergedSelection, updateChoice]);
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
        operationType: operationType,
        toggleChoice: toggleChoice,
        updateSelection: updateSelection,
    };
}

function getButtonText(side: Choice, chosenHere: boolean): string {
    switch (side) {
        case Choice.SORTED: {
            return chosenHere ? i18n.t("Using A") : i18n.t("Use A");
        }
        case Choice.UNSORTED: {
            return chosenHere ? i18n.t("Using B") : i18n.t("Use B");
        }
    }
}

const colors = {
    SELECTED_LINE_COLOR: "#c7f3d0",
    UNSELECTED_LINE_COLOR: "#fde68a",
    SELECTED_BACKGROUND_COLOR: "#10b981",
    TRANSPARENT: "transparent",
    WHITE: "#ffffff",
    BLACK: "#000000",
};
