import type { ManagedModal } from '@/promise-modal/types';

export const subscribeFactory =
  (modalId: ManagedModal['id'], dictionary: Map<ManagedModal['id'], Fn[]>) =>
  (listener: Fn) => {
    const listeners = dictionary.get(modalId) || [];
    dictionary.set(modalId, [...listeners, listener]);
    return () => {
      const listeners = dictionary.get(modalId);
      if (!listeners) return;
      dictionary.set(
        modalId,
        listeners.filter((l) => l !== listener),
      );
    };
  };
