import { render, RenderResult } from "@testing-library/react";

import { ReactNode } from "react";
import { AppContext, AppContextState } from "$/webapp/contexts/app-context";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { createAdminUser } from "$/domain/entities/__tests__/userFixtures";

export function getTestContext() {
    const context: AppContextState = {
        currentUser: createAdminUser(),
        compositionRoot: getTestCompositionRoot(),
    };

    return context;
}

export function getReactComponent(children: ReactNode): RenderResult {
    const context = getTestContext();

    return render(<AppContext.Provider value={context}>{children}</AppContext.Provider>);
}
