import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardGrid } from "$/webapp/components/card-grid/CardGrid";
import i18n from "$/utils/i18n";
import DiffViewer from "$/webapp/components/DiffViewer";

export const LandingPage: React.FC = React.memo(() => {
    const navigate = useNavigate();

    const [showDiff, setShowDiff] = useState(false);

    const originalObject = {
        name: "John",
        age: 30,
        email: "john@example.com",
    };

    const updatedObject = {
        name: "John",
        age: 31,
        email: "john.doe@example.com",
    };

    const cards: Card[] = [
        {
            title: i18n.t("Section"),
            key: "main",
            children: [
                {
                    name: "John",
                    description: "Entry point 1",
                    listAction: () => navigate("/for/John"),
                },
                {
                    name: "Mary",
                    description: "Entry point 2",
                    listAction: () => navigate("/for/Mary"),
                },
            ],
        },
    ];

    function MyButton() {
        return (
            <button onClick={() => setShowDiff(prev => !prev)}>
                {showDiff ? "Ocultar diferencias" : "Comparar ficheros"}
            </button>
        );
    }

    return (
        <>
            <CardGrid cards={cards} />

            <MyButton />

            {showDiff && (
                <div style={{ marginTop: "1rem" }}>
                    <DiffViewer original={originalObject} updated={updatedObject} />
                </div>
            )}
        </>
    );
});
