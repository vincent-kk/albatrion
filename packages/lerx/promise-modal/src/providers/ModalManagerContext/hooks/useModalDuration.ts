import type { ModalNode } from '@/promise-modal/core/node';

import { useConfigurationDuration } from '../../ConfigurationContext';
import { useModalManager } from '../useModalManagerContext';

/**
 * Reads normalized transition timing inside a modal frame, content, or footer.
 * @param modalId - Optional frame id for per-modal timing; omission reads Provider timing.
 * @returns A CSS-ready ms string and numeric milliseconds; throws outside the modal tree.
 */
export const useModalDuration = (modalId?: ModalNode['id']) => {
  const globalDuration = useConfigurationDuration();
  const { modal } = useModalManager(modalId);
  if (modal === undefined) return globalDuration;
  const milliseconds = modal.duration;
  return {
    duration: `${milliseconds}ms` as const,
    milliseconds,
  };
};
