import { type ForwardedRef, forwardRef } from 'react';

import type { ModalFrameProps } from '@amata/modal/src/types';

function DefaultForegroundFrame(
  { children }: ModalFrameProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return <div ref={ref}>{children}</div>;
}

export default DefaultForegroundFrame;

export const DefaultForegroundFrameWithRef = forwardRef(DefaultForegroundFrame);
