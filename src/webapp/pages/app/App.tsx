import { MuiThemeProvider } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { CompositionRoot } from "$/CompositionRoot";
import { AppContext, AppContextState } from "$/webapp/contexts/app-context";
import "./App.css";
import { muiTheme } from "./themes/dhis2.theme";
import { Router } from "$/webapp/pages/Router";
import { ThemeProvider } from "styled-components";

export interface AppProps {
    compositionRoot: CompositionRoot;
}

function App(props: AppProps) {
    const { compositionRoot } = props;
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            setAppContext({ compositionRoot });

            setLoading(false);
        }
        setup();
    }, []);

    if (loading) return null;

    return (
        <MuiThemeProvider theme={muiTheme}>
            <ThemeProvider theme={muiTheme}>
                <div id="app" className="content">
                    <AppContext.Provider value={appContext}>
                        <Router />
                    </AppContext.Provider>
                </div>
            </ThemeProvider>
        </MuiThemeProvider>
    );
}

export default React.memo(App);
