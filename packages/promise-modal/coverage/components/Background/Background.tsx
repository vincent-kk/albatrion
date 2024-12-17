import React, { type ForwardedRef, forwardRef } from 'react';

import {
  ModalFrameProps,
  useDestroyAfter,
  useModalDuration,
} from '../../../src';

export const Background = forwardRef(
  ({ id, background }: ModalFrameProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { duration } = useModalDuration();
    useDestroyAfter(id, duration);

    return (
      <div ref={ref}>
        <h1>{background?.data}</h1>
      </div>
    );
  },
);
