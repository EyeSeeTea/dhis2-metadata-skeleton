import i18n from "$/utils/i18n";
import { Button as MUIButton } from "@material-ui/core";

type ActionButtonProps = {
    children?: React.ReactNode;
    disabled?: boolean;
    endIcon?: React.ReactNode;
    label: string;
    startIcon?: React.ReactNode;
    onClick?: () => void;
};

export default function ActionButton(props: ActionButtonProps) {
    const { children, disabled, startIcon, endIcon, label, onClick } = props;

    return (
        <MUIButton
            variant="contained"
            color="primary"
            onClick={onClick}
            disabled={disabled}
            startIcon={startIcon}
            endIcon={endIcon}
            style={{ textTransform: "none" }}
        >
            {i18n.t(label)}
            {children}
        </MUIButton>
    );
}
