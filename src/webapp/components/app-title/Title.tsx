import styled from "styled-components";

type TitleProps = {
    children: React.ReactNode;
};

const Title: React.FC<TitleProps> = ({ children }) => {
    return (
        <TitleContainer>
            <StyledTitle>{children}</StyledTitle>
        </TitleContainer>
    );
};

export default Title;

const TitleContainer = styled.div`
    background-color: rgb(215, 215, 215);
    padding: 1.5rem 2rem;
    margin: 2rem auto;
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
