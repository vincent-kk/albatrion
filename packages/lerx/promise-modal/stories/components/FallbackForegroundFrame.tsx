import React, {
  type ForwardedRef,
  type PropsWithChildren,
  forwardRef,
} from 'react';

import { type ModalFrameProps } from '../../src';

export const FallbackForegroundFrame = forwardRef(
  (
    { onChangeOrder, children }: PropsWithChildren<ModalFrameProps>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '20px 80px',
          gap: '10px',
          border: '1px solid black',
        }}
        onClick={onChangeOrder}
      >
        {children}
      </div>
    );
  },
);
