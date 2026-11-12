import { useEffect, useRef } from 'react';

import { convertMsFromDuration } from '@winglet/common-utils/convert';
import { isString } from '@winglet/common-utils/filter';

import type { Duration } from '@aileron/declare';

import { useModalManager } from '@/promise-modal/providers';

import { useSubscribeModal } from './useSubscribeModal';

/**
 * Destroys an already settled modal after its closing animation; never closes it.
 * @param modalId - The current frame id, used inside the modal tree.
 * @param duration - Initial delay in milliseconds or a duration string.
 * @example
 * function Frame({ id, children }: PropsWithChildren<ModalFrameProps>) {
 *   useDestroyAfter(id, '300ms');
 *   return <div>{children}</div>;
 * }
 */
export const useDestroyAfter = (
  modalId: number,
  duration: Duration | number,
) => {
  const { modal, onDestroy } = useModalManager(modalId);
  const tick = useSubscribeModal(modalId);
  const milliseconds = useRef(
    isString(duration) ? convertMsFromDuration(duration) : duration,
  );
  useEffect(() => {
    if (!modal?.settled || !modal.alive) return;
    const timer = setTimeout(onDestroy, milliseconds.current);
    return () => clearTimeout(timer);
  }, [modal, onDestroy, tick]);
};
