import { css } from '@emotion/css';

export const anchor = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
  transition: background-color ease-in-out;
`;
