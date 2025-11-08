import type { Duration } from '@aileron/declare';

import type { ModalNode } from '@/promise-modal/core';
import {
  useConfigurationDuration,
  useModalManager,
} from '@/promise-modal/providers';

export const useModalDuration = (modalId?: ModalNode['id']) => {
  const globalDuration = useConfigurationDuration();
  if (modalId === undefined) return globalDuration;
  const { modal } = useModalManager(modalId);
  if (modal === undefined) return globalDuration;
  const milliseconds = modal.duration;
  return {
    duration: (milliseconds + 'ms') as Duration,
    milliseconds,
  };
};
