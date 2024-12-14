import { type ForwardedRef, forwardRef, useEffect } from 'react';

import type { ModalFrameProps } from '@/promise-modal/types';

export const FallbackForegroundFrame = forwardRef(
  (
    { id, isVisible, onCleanup, children }: ModalFrameProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    useEffect(() => {
      if (isVisible) return;
      onCleanup(id);
    }, [isVisible, id, onCleanup]);
    return <div ref={ref}>{children}</div>;
  },
);
