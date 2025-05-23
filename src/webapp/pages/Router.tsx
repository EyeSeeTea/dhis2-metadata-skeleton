import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./landing/LandingPage";

export function Router() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                {/* Catch-all fallback route */}

                <Route path="*" element={<LandingPage />} />
            </Routes>
        </HashRouter>
    );
}
