import type { ModalNode } from '../type';
import { hideModal } from './hideModal';

/** Cancels an unsettled node, including one hidden by navigation. */
export const closeModal = (
  modalNode: ModalNode,
): ReturnType<typeof setTimeout> | undefined => {
  if (modalNode.settled) return;
  modalNode.onClose();
  return hideModal(modalNode);
};
