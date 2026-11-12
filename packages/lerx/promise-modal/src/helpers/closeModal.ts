import type { ModalNode } from '@/promise-modal/core';

import { hideModal } from './hideModal';

/** Cancels an unsettled node, including one hidden by navigation. */
export const closeModal = (modalNode: ModalNode) => {
  if (modalNode.settled) return;
  modalNode.onClose();
  return hideModal(modalNode);
};
