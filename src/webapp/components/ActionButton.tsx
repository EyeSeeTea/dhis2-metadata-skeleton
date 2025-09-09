import i18n from "$/utils/i18n";
import { Button as MUIButton } from "@material-ui/core";

type ActionButtonProps = {
    children?: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
    label: string;
    onClick?: () => void;
};

export default function ActionButton(props: ActionButtonProps) {
    const { children, disabled, icon, label, onClick } = props;

    return (
        <MUIButton
            variant="contained"
            color="primary"
            onClick={onClick}
            disabled={disabled}
            startIcon={icon}
            style={{ marginLeft: "auto", textTransform: "none" }}
        >
            {i18n.t(label)}
            {children}
        </MUIButton>
    );
}
