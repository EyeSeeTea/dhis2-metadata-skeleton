import i18n from "$/utils/i18n";
import styled from "styled-components";
import Comparator from "$/webapp/components/comparator/Comparator";

export const LandingPage = () => {
    return (
        <>
            <StyledHeader>
                <LogoWrapper>
                    <Icon src="/icon.png" alt="Logo" />
                </LogoWrapper>

                <TitleContainer>
                    <StyledTitle>{i18n.t("Metadata JSON Comparator/Merge")}</StyledTitle>
                </TitleContainer>
            </StyledHeader>

            <Comparator />
        </>
    );
};

const StyledHeader = styled.header`
    display: flex;
    align-items: center;
    padding: 1rem;
    position: relative;
`;

const LogoWrapper = styled.div`
    display: flex;
    align-items: center;
`;

const Icon = styled.img`
    height: 4rem;
`;

const TitleContainer = styled.div`
    background-color: rgb(215, 215, 215);
    padding: 1.5rem 2rem;
    margin: 0rem auto;
    text-align: center;
    border-radius: 10px;
    max-width: 600px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const StyledTitle = styled.h1`
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
`;
