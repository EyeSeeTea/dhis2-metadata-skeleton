import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { CloudUpload } from "@material-ui/icons";
import i18n from "$/utils/i18n";
import { Maybe } from "$/utils/ts-utils";

type ImportFileProps = {
    onFileChange: (file: Maybe<File>) => void;
    id?: string;
    label?: string;
};

export const ImportFile: React.FC<ImportFileProps> = React.memo(props => {
    const { onFileChange, id = "upload", label } = props;

    const [selectedFile, setSelectedFile] = useState<Maybe<File>>(undefined);

    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files && files.length > 0) {
                setSelectedFile(files[0]);
                onFileChange(files[0]);
                console.debug("Handle file change:", files[0]);
            } else {
                setSelectedFile(undefined);
                onFileChange(undefined);
            }
        },
        [onFileChange]
    );

    return (
        <FileInputWrapper>
            <FileInputLabel htmlFor={id}>
                <span>{label ? i18n.t(label) : i18n.t("Select File")}</span>
                <CloudUpload />
            </FileInputLabel>
            <FileInput id={id} type="file" accept=".json" onChange={handleFileChange} />
            {selectedFile && <p>{selectedFile.name}</p>}
        </FileInputWrapper>
    );
});

const FileInputWrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;

    p {
        margin: 0;
        font-size: 0.9rem;
        color: ${props => props.theme.palette.text.secondary};
    }
`;

const FileInputLabel = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-radius: 0.5rem;
    background-color: ${props => props.theme.palette.primary.main};
    font-size: 1rem;
    color: ${props => props.theme.palette.common.white};

    &:hover {
        background-color: ${props => props.theme.palette.primary.dark};
    }
`;

const FileInput = styled.input`
    display: none;
`;
