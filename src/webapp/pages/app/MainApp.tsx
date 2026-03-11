/// <reference types="vite/client" />

import App from "./App";
import { CompositionRoot, getWebappCompositionRoot } from "$/CompositionRoot";
import { useEffect, useState } from "react";

export function MainApp(_props: {}) {
    const [compositionRootState, setCompositionRootState] = useState<CompositionRoot | null>(null);
    useEffect(() => {
        async function setup() {
            const compositionRoot = getCompositionRoot();

            setCompositionRootState(compositionRoot);
        }
        setup();
    }, []);

    return !compositionRootState ? null : <App compositionRoot={compositionRootState} />;
}

function getCompositionRoot(): CompositionRoot {
    const compositionRoot = getWebappCompositionRoot();

    return compositionRoot;
}
