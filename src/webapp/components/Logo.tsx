import styled from "styled-components";

const LogoWrapper = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
`;

const Icon = styled.img`
  width: 40px;
  height: 40px;
`;

export const Logo = () => {
  return (
    <LogoWrapper>
      <Icon src="/icon.png" alt="Logo" />
    </LogoWrapper>
  );
};