import { useSyncExternalStore } from 'react';

import { ModalManager } from '@/promise-modal/app';

/** Provides a stable snapshot when no browser store is available. */
const getServerSnapshot = () => 0;

/**
 * Subscribes to one modal by id, without requiring a modal context.
 * @param modalId - Frame id supplied to a custom modal component.
 * @returns A version that changes when this node publishes or leaves the store.
 * @example
 * function Frame({ id, visible }: ModalFrameProps) {
 *   const version = useSubscribeModal(id);
 *   useEffect(() => { console.log(id, visible); }, [id, visible, version]);
 *   return null;
 * }
 */
export const useSubscribeModal = (modalId: number): number =>
  useSyncExternalStore(
    ModalManager.subscribe,
    () => ModalManager.node(modalId)?.version ?? -1,
    getServerSnapshot,
  );
