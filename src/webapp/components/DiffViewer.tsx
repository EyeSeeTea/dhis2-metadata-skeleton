import React from "react";
import { DiffPatcher } from "jsondiffpatch";

const diffpatcher = new DiffPatcher();

interface DiffViewerProps {
    original: object;
    updated: object;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ original, updated }) => {
    const delta = diffpatcher.diff(original, updated);

    return <pre>{JSON.stringify(delta, null, 2)}</pre>;
};

export default DiffViewer;
