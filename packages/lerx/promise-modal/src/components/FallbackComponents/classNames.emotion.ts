import { css } from '@emotion/css';

export const fallback = css`
  margin: unset;
`;

export const frame = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 20px 80px;
  gap: 10px;
  border: 1px solid black;
`;
