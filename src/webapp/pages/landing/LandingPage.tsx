import React, { useState } from "react";
import DiffViewer from "$/webapp/components/DiffViewer";

export const LandingPage: React.FC = React.memo(() => {


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

  
    function MyButton() {
        return (
            <button onClick={() => setShowDiff(prev => !prev)}>
                {showDiff ? "Ocultar diferencias" : "Comparar ficheros"}
            </button>
        );
    }

    return (
        <>
       

            <MyButton />

            {showDiff && (
                <div style={{ marginTop: "1rem" }}>
                    <DiffViewer original={originalObject} updated={updatedObject} />
                </div>
            )}
        </>
    );
});
