import { ModalManager } from '@/promise-modal/app';
import type { ModalNode } from '@/promise-modal/core';

export const hideModal = (modalNode: ModalNode, refresh = true) => {
  modalNode.onHide();
  if (refresh) ModalManager.refresh();
  if (modalNode.manualDestroy || modalNode.alive === false) return;
  return setTimeout(() => modalNode.onDestroy(), modalNode.duration);
};
