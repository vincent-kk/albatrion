import { type ForwardedRef, forwardRef } from 'react';

import type { ModalFrameProps } from '@/promise-modal/types';

export const FallbackForegroundFrame = forwardRef(
  ({ children }: ModalFrameProps, ref: ForwardedRef<HTMLDivElement>) => {
    return <div ref={ref}>{children}</div>;
  },
);
