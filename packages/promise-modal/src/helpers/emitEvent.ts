import type { ManagedModal } from '@/promise-modal/types';

export const emitEvent = (
  modalId: ManagedModal['id'],
  dictionary: Map<ManagedModal['id'], Fn[]>,
) => {
  const listeners = dictionary.get(modalId) || [];
  for (const listener of listeners) listener();
};
