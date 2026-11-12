import { useSyncExternalStore } from 'react';

import { ModalManager } from '@/promise-modal/app';
import type { ModalNodeView } from '@/promise-modal/types/modal';

/** Counts visible nodes unless an application supplies a metadata predicate. */
const defaultValidate = (node: ModalNodeView) => node.visible;
/** Server rendering never exposes the browser's modal store. */
const getServerSnapshot = () => 0;

/**
 * Subscribes to matching nodes from any component, including outside ModalProvider.
 * @param validate - Pure predicate over read-only metadata; defaults to visible nodes.
 * @returns The current matching count, or zero during server rendering.
 * @example
 * const count = useActiveModalCount(node => node.visible && node.group === 'checkout');
 */
export const useActiveModalCount = (
  validate: (node: ModalNodeView) => boolean | undefined = defaultValidate,
): number =>
  useSyncExternalStore(
    ModalManager.subscribe,
    () => {
      let count = 0;
      for (const id of ModalManager.ids) {
        const node = ModalManager.node(id);
        if (node && validate(node)) count++;
      }
      return count;
    },
    getServerSnapshot,
  );
