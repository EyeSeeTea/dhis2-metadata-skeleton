import ButtonContainer from "$/webapp/components/ButtonContainer";
import { ImportFile } from "$/webapp/components/import-file/ImportFile";
import JsonContainer from "$/webapp/components/JsonContainer";
import JsonDisplay from "$/webapp/components/JsonDisplay";
import Title from "$/webapp/components/Title";
import { useEffect, useState } from "react";

export const LandingPage = () => {
    const [jsonFileUnsorted, setJsonFileUnsorted] = useState<File | undefined>();
    const [jsonFileSorted, setJsonFileSorted] = useState<File | undefined>();

    console.debug("State Unsorted JSON File:", jsonFileUnsorted);
    console.debug("State Sorted JSON File:", jsonFileSorted);

    // States for the parsed JSON content
    const [jsonContentUnsorted, setJsonContentUnsorted] = useState<any>(null);
    const [jsonContentSorted, setJsonContentSorted] = useState<any>(null);

    // Read and parse JSON file for "Unsorted"
    useEffect(() => {
        if (!jsonFileUnsorted) {
            setJsonContentUnsorted(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result as string);
                setJsonContentUnsorted(parsed);
            } catch (error) {
                console.error("Error parsing unsorted JSON:", error);
                setJsonContentUnsorted(null);
            }
        };
        reader.readAsText(jsonFileUnsorted);
    }, [jsonFileUnsorted]);

    // Read and parse JSON file for "Sorted"
    useEffect(() => {
        if (!jsonFileSorted) {
            setJsonContentSorted(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result as string);
                setJsonContentSorted(parsed);
            } catch (error) {
                console.error("Error parsing sorted JSON:", error);
                setJsonContentSorted(null);
            }
        };
        reader.readAsText(jsonFileSorted);
    }, [jsonFileSorted]);

    return (
        <div>
            <Title>Json Comparator</Title>

            <ButtonContainer>
                <div>
                    <p>Upload unsorted :</p>
                    <ImportFile id="upload-unsorted" setFile={setJsonFileUnsorted} />
                </div>

                <div>
                    <p>Upload sorted :</p>
                    <ImportFile id="upload-sorted" setFile={setJsonFileSorted} />
                </div>
            </ButtonContainer>

            <JsonDisplay>
                <JsonContainer>
                    <strong>Unsorted JSON :</strong>
                    <pre>
                        {jsonContentUnsorted
                            ? JSON.stringify(jsonContentUnsorted, null, 2)
                            : "No file uploaded or invalid JSON."}
                    </pre>
                </JsonContainer>
                <JsonContainer>
                    <strong>Comparison</strong>
                    <pre>
                        {}
                        {jsonContentUnsorted && jsonContentSorted
                            ? "Comparison goes here"
                            : "Upload both files to see the comparison."}
                    </pre>
                </JsonContainer>
                <JsonContainer>
                    <strong>Sorted JSON :</strong>

                    <pre>
                        {jsonContentSorted
                            ? JSON.stringify(jsonContentSorted, null, 2)
                            : "No file uploaded or invalid JSON."}
                    </pre>
                </JsonContainer>
            </JsonDisplay>
        </div>
    );
};
