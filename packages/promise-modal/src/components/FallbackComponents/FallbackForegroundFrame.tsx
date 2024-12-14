import { type ForwardedRef, forwardRef, useEffect } from 'react';

import type { ModalFrameProps } from '@/promise-modal/types';

export const FallbackForegroundFrame = forwardRef(
  (
    { id, visible, children, onDestroy }: ModalFrameProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    useEffect(() => {
      if (visible) return;
      onDestroy(id);
    }, [visible, id, onDestroy]);
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
