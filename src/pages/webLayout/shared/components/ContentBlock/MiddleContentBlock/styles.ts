import styled from "styled-components";

export const RightBlockContainer = styled.section`
  position: relative;
  background-color: rgb(254, 222, 185);
  //padding: 12rem 27rem 5rem 27rem;
  padding: 8rem 5rem 5rem 10rem;

  /* @media only screen and (max-width: 1024px) {
    padding: 12rem 5rem 5rem 5rem;
  }

  @media only screen and (max-width: 768px) {
    padding: 12rem 5rem 5rem 5rem;
  } */
`;

export const Content = styled.p`
  margin: 1.5rem 0 2rem 0;
`;

export const ContentWrapper = styled.div`
  position: relative;
  max-width: 540px;

  @media only screen and (max-width: 575px) {
    padding-bottom: 4rem;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 100%;

  @media screen and (min-width: 1024px) {
    max-width: 80%;
  }

  button:last-child {
    margin-left: 20px;
  }
`;
