import { type ForwardedRef, forwardRef } from 'react';

import type { ModalFrameProps } from '@/promise-modal/types';

export const FallbackForegroundFrame = forwardRef(
  ({ children }: ModalFrameProps, ref: ForwardedRef<HTMLDivElement>) => {
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
        }}
      >
        {children}
      </div>
    );
  },
);
