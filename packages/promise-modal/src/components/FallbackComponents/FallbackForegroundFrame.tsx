import { type ForwardedRef, forwardRef, useMemo } from 'react';

import { useActiveModalCount } from '@/promise-modal/hooks/useActiveModalCount';
import type { ModalFrameProps } from '@/promise-modal/types';

const MAX_MODAL_COUNT = 5;
const MAX_MODAL_LEVEL = 3;

export const FallbackForegroundFrame = forwardRef(
  ({ modal, children }: ModalFrameProps, ref: ForwardedRef<HTMLDivElement>) => {
    const activeCount = useActiveModalCount();
    const [level, offset] = useMemo(() => {
      const stacked = activeCount > 1;
      const level = stacked
        ? (Math.floor(modal.id / MAX_MODAL_COUNT) % MAX_MODAL_LEVEL) * 100
        : 0;
      const offset = stacked ? (modal.id % MAX_MODAL_COUNT) * 35 : 0;
      return [level, offset];
    }, [activeCount, modal.id]);

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
          marginBottom: `calc(25vh + ${level}px)`,
          marginLeft: `${level}px`,
          gap: '10px',
          border: '1px solid black',
          transform: `translate(${offset}px, ${offset}px)`,
        }}
      >
        {children}
      </div>
    );
  },
);
