import i18n from "$/utils/i18n";
import styled from "styled-components";
import Comparator from "$/webapp/components/comparator/Comparator";
import iconImage from "$/webapp/components/share/logo-eyeseetea.png";

export const LandingPage = () => {
    return (
        <>
            <Header>
                <LogoWrapper>
                    <Icon src={iconImage} alt="logo" />
                </LogoWrapper>

                <StyledTitle>{i18n.t("Metadata JSON Merge tool")}</StyledTitle>
            </Header>

            <Comparator />
        </>
    );
};

const Header = styled.header`
    display: flex;
    align-items: center;
    padding: 1rem 3rem;
    background-color: ${props => props.theme.palette.primary.main};
`;

const LogoWrapper = styled.div`
    display: flex;
    align-items: center;
`;

const Icon = styled.img`
    height: 4rem;
`;

const StyledTitle = styled.h1`
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    padding-inline: 1.5rem;
    color: ${props => props.theme.palette.common.white};
`;
