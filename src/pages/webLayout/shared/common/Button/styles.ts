import styled from "styled-components";

export const StyledButton = styled.button<any>`
  background: ${(p) => p.color || "#3c4760"};
  color: ${(p) => (p.color ? "#2E186A" : "#fff")};
  font-size: 1rem;
  font-weight: 700;
  //width: 80%;
  border: 1px solid #edf3f5;
  border-radius: 4px;
  padding: 14px 20px;
  cursor: pointer;
  //margin-top: 0.625rem;
  max-width: 350px;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 16px 30px rgb(23 31 114 / 20%);
  white-space: nowrap;

  &:disabled {
    background: #ccc; // Change the color to indicate disabled status
    cursor: not-allowed; // Change the cursor
    box-shadow: none; // Remove the box shadow
  }

  /* &:hover,
  &:active,
  &:focus {
    color: #fff;
    border: 1px solid rgb(255, 130, 92);
    background-color: rgb(255, 130, 92);
  } */
`;
