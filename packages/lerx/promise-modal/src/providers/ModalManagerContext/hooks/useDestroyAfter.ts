import { useEffect, useMemo } from 'react';

import { useSubscribeModal } from '@/promise-modal/app';
import { normalizeDuration } from '@/promise-modal/helpers/normalizeDuration';
import type { ModalOptions } from '@/promise-modal/types/option';

import { useConfigurationContext } from '../../ConfigurationContext';
import { useModalManager } from '../useModalManagerContext';

/**
 * Destroys an already settled modal after its closing animation; never closes it.
 * @param modalId - The current frame id, used inside the modal tree.
 * @param duration - Current delay in milliseconds or a duration string.
 * @example
 * function Frame({ id, children }: PropsWithChildren<ModalFrameProps>) {
 *   useDestroyAfter(id, '300ms');
 *   return <div>{children}</div>;
 * }
 */
export const useDestroyAfter = (
  modalId: number,
  duration: NonNullable<ModalOptions['duration']>,
) => {
  const { options } = useConfigurationContext('useDestroyAfter');
  const { modal, onDestroy } = useModalManager(modalId);
  const tick = useSubscribeModal(modalId);
  const milliseconds = useMemo(
    () => parseFloat(normalizeDuration(duration, options.duration)),
    [duration, options.duration],
  );
  useEffect(() => {
    if (!modal?.settled || !modal.alive) return;
    const timer = setTimeout(onDestroy, milliseconds);
    return () => clearTimeout(timer);
  }, [modal, onDestroy, tick, milliseconds]);
};
