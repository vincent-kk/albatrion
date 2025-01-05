import { css } from '@emotion/css';

export const foreground = css`
  pointer-events: none;
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1;
`;

export const active = css`
  > * {
    pointer-events: all;
  }
`;

export const visible = css`
  display: flex !important;
  justify-content: center;
  align-items: center;
`;
