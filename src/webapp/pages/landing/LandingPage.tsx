import i18n from "$/utils/i18n";
import styled from "styled-components";
import Comparator from "$/webapp/components/comparator/Comparator";
import logoImage from "$/webapp/components/share/logo-eyeseetea.png";

export const LandingPage = () => {
    return (
        <Container>
            <Header>
                <LogoWrapper>
                    <Logo src={logoImage} alt="EyeSeeTea Logo" />
                </LogoWrapper>
                <Title>{i18n.t("Metadata JSON Merge tool")}</Title>
            </Header>

            <Main>
                <Comparator />
            </Main>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`;

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

const Logo = styled.img`
    height: 4rem;
    width: auto;
`;

const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    padding-inline-start: 1.5rem;
    color: ${props => props.theme.palette.common.white};
`;

const Main = styled.main`
    flex: 1;
`;
