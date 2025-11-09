import { ModalManager } from '@/promise-modal/app/ModalManager';
import type { ModalNode } from '@/promise-modal/core';

export const closeModal = (modalNode: ModalNode, refresh = true) => {
  if (modalNode.visible === false) return;
  modalNode.onClose();
  modalNode.onHide();
  if (refresh) ModalManager.refresh();
  if (modalNode.manualDestroy || modalNode.alive === false) return;
  return setTimeout(() => modalNode.onDestroy(), modalNode.duration);
};
