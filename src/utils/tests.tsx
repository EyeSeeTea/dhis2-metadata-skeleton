import { render, RenderResult } from "@testing-library/react";
import { ReactNode } from "react";
import { AppContext, AppContextState } from "$/webapp/contexts/app-context";
import { getTestCompositionRoot } from "$/CompositionRoot";

export function getTestContext() {
    const context: AppContextState = {
        compositionRoot: getTestCompositionRoot(),
    };

    return context;
}

export function getReactComponent(children: ReactNode): RenderResult {
    const context = getTestContext();

    return render(<AppContext.Provider value={context}>{children}</AppContext.Provider>);
}
