import type { ModalNode } from '@/promise-modal/core';
import {
  useConfigurationDuration,
  useModalManager,
} from '@/promise-modal/providers';

export const useModalDuration = (id?: ModalNode['id']) => {
  const globalDuration = useConfigurationDuration();
  if (id === undefined) return globalDuration;
  const { modal } = useModalManager(id);
  if (modal === undefined) return globalDuration;
  const milliseconds = modal.duration;
  return { duration: milliseconds + 'ms', milliseconds };
};
