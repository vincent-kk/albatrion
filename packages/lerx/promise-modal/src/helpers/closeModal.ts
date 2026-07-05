import type { ModalNode } from '@/promise-modal/core';

import { hideModal } from './hideModal';

export const closeModal = (modalNode: ModalNode, refresh = true) => {
  if (modalNode.visible === false) return;
  modalNode.onClose();
  return hideModal(modalNode, refresh);
};
