import styled from "styled-components";
import { Link } from "react-router-dom";
import { MenuOutlined } from "@ant-design/icons";

export const HeaderSection = styled.header`
  .padding: 1rem 0.5rem;

  position: fixed;
  .ant-row-space-between {
    align-items: center;
    text-align: center;
  }
  padding-top: 40px

  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: #fff;
  padding: 0.5rem 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .ant-row-space-between {
    align-items: center;
    text-align: center;
  }
`;

export const LogoContainer = styled(Link)`
  display: flex;
  padding-left: 15px;

  @media (max-width: 500px) {
    padding-left: 15px;
  }
`;

export const NavLink = styled.div`
  display: inline-block;
  text-align: center;
`;

export const CustomNavLink = styled.div`
  width: 203px;
  display: inline-block;

  @media only screen and (max-width: 411px) {
    width: 150px;
  }

  @media only screen and (max-width: 320px) {
    width: 118px;
  }
`;

export const ContactWrapper = styled.div<any>`
  cursor: pointer;
  width: ${(p) => (p.width ? "100%" : "110px")};
  font-weight: 700;
  text-align: center;
  border-radius: 1.25rem;
  display: inline-block;
`;

export const Burger = styled.div`
  @media only screen and (max-width: 1350px) {
    display: block;
  }

  display: none;

  svg {
    fill: #2e186a;
  }
`;

export const NotHidden = styled.div`
  @media only screen and (max-width: 1350px) {
    display: none;
  }
`;

export const Menu = styled.h5`
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
`;

export const CustomNavLinkSmall = styled(NavLink)`
  font-size: 1.2rem;
  color: #18216d;
  transition: color 0.2s ease-in;
  margin: 0.5rem 2rem;

  @media only screen and (max-width: 768px) {
    margin: 1.25rem 2rem;
  }
`;

export const Label = styled.span`
  font-weight: 500;
  color: #404041;
  text-align: right;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

export const Outline = styled(MenuOutlined)<any>`
  font-size: 22px;
`;

export const Span = styled.span`
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover,
  &:active,
  &:focus {
    color: rgb(255, 130, 92);
    text-underline-position: under;
    text-decoration: rgb(255, 130, 92) wavy underline;
  }
`;

export const ButtonWrapper = styled.div`
  @media screen and (min-width: 1350px) {
    max-width: 80%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 100%;

    button:first-child {
      margin-right: 20px;
    }
  }
  @media screen and (max-width: 1350px) {
    button:first-child {
      margin-bottom: 20px;
    }
  }
`;
