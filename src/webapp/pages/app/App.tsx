import { MuiThemeProvider } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { CompositionRoot } from "$/CompositionRoot";
import { AppContext, AppContextState } from "$/webapp/contexts/app-context";
import "./App.css";
import { muiTheme } from "./themes/dhis2.theme";
import { Router } from "$/webapp/pages/Router";
import { ThemeProvider } from "styled-components";
import Share from "$/webapp/components/share/Share";
import { appConfig } from "$/app-config";

export interface AppProps {
    compositionRoot: CompositionRoot;
}

function App(props: AppProps) {
    const { compositionRoot } = props;
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);
    const [showShareButton, setShowShareButton] = useState(false);

    useEffect(() => {
        async function setup() {
            const isShareButtonVisible = appConfig.appearance.showShareButton;
            setShowShareButton(isShareButtonVisible);
            setAppContext({ compositionRoot });

            setLoading(false);
        }
        setup();
    }, [compositionRoot]);

    if (loading) return null;

    return (
        <MuiThemeProvider theme={muiTheme}>
            <ThemeProvider theme={muiTheme}>
                <div id="app" className="content">
                    <AppContext.Provider value={appContext}>
                        <Router />
                    </AppContext.Provider>
                </div>

                <Share visible={showShareButton} />
            </ThemeProvider>
        </MuiThemeProvider>
    );
}

export default React.memo(App);
