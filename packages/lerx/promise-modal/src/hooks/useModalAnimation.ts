import { useRef } from 'react';

import type { Fn } from '@aileron/declare';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

interface ModalAnimationHandler {
  onVisible?: Fn;
  onHidden?: Fn;
}

/**
 * Runs committed visibility callbacks on the next animation frame.
 * @param visible - Current display state; route hiding also triggers onHidden.
 * @param handler - onVisible/onHidden callbacks from the latest committed render.
 * @returns Nothing; pending frames are cancelled when visibility changes or on unmount.
 * @remarks This hook does not close or destroy a request. It uses a passive effect without a DOM.
 * @example
 * ```tsx
 * import { useRef } from 'react';
 * import { useModalAnimation } from '@lerx/promise-modal';
 *
 * function Fade({ visible }: { visible: boolean }) {
 *   const ref = useRef<HTMLDivElement>(null);
 *   useModalAnimation(visible, {
 *     onVisible: () => { if (ref.current) ref.current.style.opacity = '1'; },
 *     onHidden: () => { if (ref.current) ref.current.style.opacity = '0'; },
 *   });
 *   return <div ref={ref} style={{ opacity: 0, transition: 'opacity 300ms' }}>Content</div>;
 * }
 * ```
 */
export const useModalAnimation = (
  visible: boolean,
  handler: ModalAnimationHandler,
) => {
  const handlerRef = useRef(handler);
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  useIsomorphicLayoutEffect(() => {
    if (!handlerRef.current) return;
    let frame: ReturnType<typeof requestAnimationFrame>;
    if (visible)
      frame = requestAnimationFrame(() => handlerRef.current.onVisible?.());
    else frame = requestAnimationFrame(() => handlerRef.current.onHidden?.());
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [visible]);
};
