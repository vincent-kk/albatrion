import {
  type ForwardedRef,
  type PropsWithChildren,
  forwardRef,
  useMemo,
} from 'react';

import { useActiveModalCount } from '@/promise-modal/hooks/useActiveModalCount';
import type { ModalFrameProps } from '@/promise-modal/types';

import { frame } from './classNames.emotion';

const MAX_MODAL_COUNT = 5;
const MAX_MODAL_LEVEL = 3;

export const FallbackForegroundFrame = forwardRef(
  (
    { id, onChangeOrder, children }: PropsWithChildren<ModalFrameProps>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const activeCount = useActiveModalCount();
    const [level, offset] = useMemo(() => {
      const stacked = activeCount > 1;
      const level = stacked
        ? (Math.floor(id / MAX_MODAL_COUNT) % MAX_MODAL_LEVEL) * 100
        : 0;
      const offset = stacked ? (id % MAX_MODAL_COUNT) * 35 : 0;
      return [level, offset];
    }, [activeCount, id]);

    return (
      <div
        ref={ref}
        className={frame}
        onClick={onChangeOrder}
        style={{
          marginBottom: `calc(25vh + ${level}px)`,
          marginLeft: `${level}px`,
          transform: `translate(${offset}px, ${offset}px)`,
        }}
      >
        {children}
      </div>
    );
  },
);
