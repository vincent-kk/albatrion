import { useLayoutEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

interface ModalAnimationHandler {
  onVisible?: Fn;
  onHidden?: Fn;
}

export const useModalAnimation = (
  visible: boolean,
  handler: ModalAnimationHandler,
) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useLayoutEffect(() => {
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
