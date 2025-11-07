import type { ModalNode } from '@/promise-modal/core';

import { closeModal } from './closeModal';

export const subscribeAbortSignal = (
  modalNode: ModalNode,
  signal: AbortSignal | undefined,
) => {
  if (signal === undefined) return null;
  const handleAbort = () => closeModal(modalNode);
  signal.addEventListener('abort', handleAbort, { once: true });
  return () => signal.removeEventListener('abort', handleAbort);
};
