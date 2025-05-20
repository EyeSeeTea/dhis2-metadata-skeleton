import styled from "styled-components";
import { HeaderBar } from "@dhis2/ui";

import { MuiThemeProvider } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { appConfig } from "$/app-config";
import { CompositionRoot } from "$/CompositionRoot";
import Share from "$/webapp/components/share/Share";
import { AppContext, AppContextState } from "$/webapp/contexts/app-context";
import "./App.css";
import { muiTheme } from "./themes/dhis2.theme";
import { Router } from "$/webapp/pages/Router";

export interface AppProps {
    compositionRoot: CompositionRoot;
}

function App(props: AppProps) {
    const { compositionRoot } = props;
    const [showShareButton, setShowShareButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            const isShareButtonVisible = appConfig.appearance.showShareButton;
            const currentUser = await compositionRoot.users.getCurrent.execute().toPromise();
            if (!currentUser) throw new Error("User not logged in");

            setAppContext({ currentUser, compositionRoot });
            setShowShareButton(isShareButtonVisible);
            setLoading(false);
        }
        setup();
    }, [compositionRoot]);

    if (loading) return null;

    return (
        <MuiThemeProvider theme={muiTheme}>
            <>
                <StyledHeaderBar appName="Skeleton App" />

                <div id="app" className="content">
                    <AppContext.Provider value={appContext}>
                        <Router />
                    </AppContext.Provider>
                </div>

                <Share visible={showShareButton} />
            </>
        </MuiThemeProvider>
    );
}

const StyledHeaderBar = styled(HeaderBar)`
    div:first-of-type {
        box-sizing: border-box;
    }
`;

export default React.memo(App);
