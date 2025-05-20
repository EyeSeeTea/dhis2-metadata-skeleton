import { Icon, IconButton as MUIIConButton } from "@material-ui/core";
import { Variant } from "@material-ui/core/styles/createTypography";
import Typography from "@material-ui/core/Typography";
import React, { PropsWithChildren } from "react";
import styled from "styled-components";
import i18n from "$/utils/i18n";

export const PageHeader: React.FC<PageHeaderProps> = React.memo(props => {
    const { variant = "h5", title, onBackClick, children } = props;
    return (
        <div>
            {!!onBackClick && (
                <BackButton
                    onClick={onBackClick}
                    color="secondary"
                    aria-label={i18n.t("Back")}
                    data-test={"page-header-back"}
                >
                    <Icon color="primary">arrow_back</Icon>
                </BackButton>
            )}

            <Title variant={variant} gutterBottom data-test={"page-header-title"}>
                {title}
            </Title>

            {children}
        </div>
    );
});

export interface PageHeaderProps extends PropsWithChildren {
    variant?: Variant;
    title: string;
    onBackClick?: () => void;
    helpText?: string;
}

const Title = styled(Typography)`
    display: inline-block;
    font-weight: 300;
`;

const IconButton = styled(MUIIConButton)`
    margin-bottom: 8px;
`;

const BackButton = styled(IconButton)`
    padding-top: 10px;
    margin-bottom: 5px;
`;
