import type { ModalNode } from '@/promise-modal/core';

export const closeModal = (modalNode: ModalNode) => {
  if (modalNode.visible === false) return;
  modalNode.onClose();
  modalNode.onHide();
  if (modalNode.manualDestroy || modalNode.alive === false) return;
  return setTimeout(() => modalNode.onDestroy(), modalNode.duration);
};
