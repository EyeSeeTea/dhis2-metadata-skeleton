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

    const selectedLineColor = changed ? (isSelectedSide ? "#c7f3d0" : "#fde68a") : "transparent";
    const selectedBackgroundColor = isSelectedSide ? "#10b981" : "white";
    const selectedButtonTextColor = isSelectedSide ? "white" : "black";

    const opKindByPath = useMemo<Record<string, OpType>>(
        () =>
            rows.reduce<Record<string, OpType>>(
                (acc, r) => ({ ...acc, [r.path]: r.op.op as OpType }),
                {}
            ),
        [props.rows]
    );

    const operationType = useMemo(() => (path ? opKindByPath[path] : undefined), [path]);
    const lineButtonText = useMemo(
        () => getButtonText(side, isSelectedSide),
        [side, isSelectedSide]
    );
    const isPathModified = useMemo(() => changed && path !== undefined, [changed, path]);

    const toggleChoice = useCallback(() => {
        if (path) updateChoice(path, mergedSelection[path] === "unsorted" ? "sorted" : "unsorted");
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
        case "sorted": {
            return chosenHere ? i18n.t("Using A") : i18n.t("Use A");
        }
        case "unsorted": {
            return chosenHere ? i18n.t("Using B") : i18n.t("Use B");
        }
    }
}
