import { type ForwardedRef, forwardRef } from 'react';

import type { ModalFrameProps } from '@/promise-modal/types';

const MAX_MODAL_COUNT = 5;

export const FallbackForegroundFrame = forwardRef(
  ({ modal, children }: ModalFrameProps, ref: ForwardedRef<HTMLDivElement>) => {
    const modalOffset = (modal.id % MAX_MODAL_COUNT) * 25;
    const modalLevel = Math.floor(modal.id / MAX_MODAL_COUNT);
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
          marginBottom: `${25 + modalLevel * 10}vh`,
          marginLeft: `${-modalLevel * 15}vw`,
          gap: '10px',
          border: '1px solid black',
          transform: `translate(${modalOffset}px, ${modalOffset}px)`,
        }}
      >
        {children}
      </div>
    );
  },
);
