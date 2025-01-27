import React, {
  type ForwardedRef,
  type PropsWithChildren,
  forwardRef,
} from 'react';

import { css } from '@emotion/css';

import { type ModalFrameProps } from '../../src';

export const FallbackForegroundFrame = forwardRef(
  (
    { onChangeOrder, children }: PropsWithChildren<ModalFrameProps>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <div ref={ref} className={frame} onClick={onChangeOrder}>
        {children}
      </div>
    );
  },
);

const frame = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 20px 80px;
  gap: 10px;
  border: 1px solid black;
`;
