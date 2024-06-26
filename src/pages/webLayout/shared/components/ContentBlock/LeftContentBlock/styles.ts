import styled from "styled-components";

export const LeftContentSection = styled("section")`
  position: relative;

  @media only screen and (max-width: 1024px) {
  }
`;

export const Content = styled("p")`
  margin: 1.5rem 0 2rem 0;
  font-size: 18px;
`;

export const ContentWrapper = styled.div`
  position: relative;
  max-width: 540px;
  @media only screen and (max-width: 575px) {
    padding-top: 4rem;
  }
`;

export const ServiceWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 100%;
`;

export const MinTitle = styled.h6`
  font-size: 15px;
  line-height: 1rem;
  padding: 0.5rem 0;
  text-transform: uppercase;
  color: #000;
  font-family: "Motiva Sans Light", sans-serif;
`;

export const MinPara = styled.p`
  font-size: 13px;
`;
