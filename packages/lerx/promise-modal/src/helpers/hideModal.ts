import type { ModalNode } from '@/promise-modal/core';

/** Hides a completed node and schedules its automatic destruction. */
export const hideModal = (modalNode: ModalNode) => {
  modalNode.onHide();
  if (modalNode.manualDestroy || !modalNode.alive) return;
  return setTimeout(() => modalNode.onDestroy(), modalNode.duration);
};
