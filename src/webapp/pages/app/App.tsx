import styled from "styled-components";
import { HeaderBar } from "@dhis2/ui";
import { MuiThemeProvider } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { CompositionRoot } from "$/CompositionRoot";
import { AppContext, AppContextState } from "$/webapp/contexts/app-context";
import "./App.css";
import { muiTheme } from "./themes/dhis2.theme";
import { Router } from "$/webapp/pages/Router";

export interface AppProps {
    compositionRoot: CompositionRoot;
}

function App(props: AppProps) {
    const { compositionRoot } = props;
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {

            setAppContext({compositionRoot});

            setLoading(false);
        }
        setup();
    }, []);

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
