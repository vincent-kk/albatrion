import type { ModalNode } from '../type';

/** Hides a completed node and schedules its automatic destruction. */
export const hideModal = (
  modalNode: ModalNode,
): ReturnType<typeof setTimeout> | undefined => {
  modalNode.onHide();
  if (modalNode.manualDestroy || !modalNode.alive) return;
  return setTimeout(() => modalNode.onDestroy(), modalNode.duration);
};
