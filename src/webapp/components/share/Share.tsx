import { useState } from "react";
import logo from "./logo-eyeseetea.png";
import styled from "styled-components";

type ShareProps = {
    visible: boolean;
};

export function Share(props: ShareProps) {
    const { visible } = props;
    const [expanded, setExpanded] = useState(false);

    const openMainPage = () => window.open("http://www.eyeseetea.com/", "_blank");
    const openTwitter = () => window.open("https://twitter.com/eyeseetealtd", "_blank");

    if (!visible) return null;

    return (
        <div>
            <ShareTab>
                <ShareButton onClick={() => setExpanded(!expanded)}>
                    <i className="fa fa-share icon-xlarge" />
                </ShareButton>
            </ShareTab>

            {expanded && (
                <ShareContent>
                    <p>
                        <StyledButton onClick={openMainPage}>
                            <LogoIcon src={logo} alt="EyeSeeTea" />
                        </StyledButton>
                    </p>

                    <p>
                        <StyledButton onClick={openTwitter}>
                            <TwitterIcon className="fa fa-twitter" />
                        </StyledButton>
                    </p>
                </ShareContent>
            )}
        </div>
    );
}

const ShareContent = styled.div`
    background-color: rgb(243, 243, 243);
    position: fixed;
    bottom: 0px;
    right: 100px;
    border-radius: 0px;
    height: auto;
    opacity: 0.85;
    padding-bottom: 30px;
    width: 65px;
    z-index: 10001;
    text-align: center;
`;

const StyledButton = styled.button`
    width: 35px;
    cursor: pointer;
    background-color: white;
    border-radius: 0px;
    opacity: 1;
    color: white;
    box-shadow: none;
    text-shadow: none;
    border: 0px;
    text-align: center;
`;

const LogoIcon = styled.img`
    width: 15px;
`;

const TwitterIcon = styled.i`
    color: #477726;
    font-size: 20px;
`;

const ShareTab = styled.div`
    bottom: -3px;
    right: 100px;
    position: fixed;
    z-index: 10002;
`;

const ShareButton = styled.button`
    text-shadow: none;
    background-color: #ff9800;
    color: white;
    width: 65px;
    height: 38.5px;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    background-clip: padding-box;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

    &:hover {
        border: 2px solid #ff9800;
    }
`;

export default Share;
