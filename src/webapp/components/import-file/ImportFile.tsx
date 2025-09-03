import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { CloudUpload } from "@material-ui/icons";
import i18n from "$/utils/i18n";

type ImportFileProps = {
    onFileChange: (file: File | undefined) => void;
    id?: string;
};

export const ImportFile: React.FC<ImportFileProps> = React.memo(props => {
    const { onFileChange, id = "upload" } = props;

    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
            onFileChange(files[0]);
            console.debug("Handle file change:", files[0]);
        } else {
            setSelectedFile(undefined);
            onFileChange(undefined);
        }
    }, []);

    return (
        <FileInputWrapper>
            <FileInputLabel htmlFor={id}>
                <span>{i18n.t("Select File")}</span>
                <CloudUpload />
            </FileInputLabel>
            <FileInput id={id} type="file" accept=".json" onChange={handleFileChange} />
            {selectedFile && <p>{selectedFile.name}</p>}
        </FileInputWrapper>
    );
});

const FileInputWrapper = styled.div`
    position: relative;
    margin-top: 1rem;
    width: min-width;
    display: flex;
    gap: 0.5rem;
`;

const FileInputLabel = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-radius: 0.5rem;
    background-color: #1976d2;
    font-size: 1rem;
    color: #fff;
`;

const FileInput = styled.input`
    display: none;
`;
