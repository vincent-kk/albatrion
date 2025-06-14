import { css } from '@emotion/css';

export const background = css`
  display: none;
  position: fixed;
  inset: 0;
  z-index: -999;
  pointer-events: none;
  > * {
    pointer-events: none;
  }
`;

export const active = css`
  pointer-events: all;
`;

export const visible = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;
