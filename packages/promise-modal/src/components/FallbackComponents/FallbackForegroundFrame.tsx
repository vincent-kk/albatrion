import { type ForwardedRef, forwardRef, useEffect } from 'react';

import type { ModalFrameProps } from '@/promise-modal/types';

export const FallbackForegroundFrame = forwardRef(
  (
    { modal, handlers, children }: ModalFrameProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const visible = modal.visible;
    const onDestroy = handlers.onDestroy;
    useEffect(() => {
      if (visible) return;
      onDestroy();
    }, [visible, onDestroy]);
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
