import styled from "styled-components";

export const StyledContainer = styled.div<any>`
  position: relative;
  width: 100%;

  margin-right: auto;
  margin-left: auto;

  border-top: ${(p) => (p.border ? "1px solid #CDD1D4" : "")};

  @media only screen and (max-width: 1024px) {
    max-width: 100%;
    padding: 0 0px;
  }

  @media only screen and (max-width: 768px) {
    max-width: 100%;
    padding: 0 0px;
  }

  @media only screen and (max-width: 414px) {
    max-width: 100%;
    padding: 0 0px;
  }
`;
