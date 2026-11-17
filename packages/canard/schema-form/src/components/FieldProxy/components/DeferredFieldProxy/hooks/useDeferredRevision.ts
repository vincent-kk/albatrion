import { useCallback, useSyncExternalStore } from 'react';

import type { Fn } from '@aileron/declare';

import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';
import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';

import type { DeferredRevisionGate } from '../type';

/** Presence and path are the only node deliveries relevant to a waiting gate. */
const TRACKING =
  FieldNodeEventType.UpdateControlledProperties | FieldNodeEventType.UpdatePath;

/**
 * Combine node and live-option revisions in the gate's single external store.
 * @param node - Field rendered by this gate.
 * @param branch - Render owner, which can differ from the physical node parent.
 * @param manager - Stable coordinator whose options only change at commit.
 * @param preparedRevision - Revision when the cached child chose its gate.
 * @param gate - Position-owned option cleanup and stable reveal transition.
 * @returns Combined monotonic revision; subscribing catches a render/commit gap.
 */
export const useDeferredRevision = (
  node: FieldNode,
  branch: FieldNode,
  manager: VirtualizationManager,
  preparedRevision: number,
  gate: DeferredRevisionGate,
): number => {
  const subscribe = useCallback(
    (onStoreChange: Fn) => {
      const unsubscribeNode = node.subscribe(({ type }) => {
        if (type & TRACKING) onStoreChange();
      });
      const updateOptions = () => {
        const children = branch.children;
        if (
          !manager
            .forBranch(children?.length ?? 0)
            ?.forChild(children?.indexOf(node) ?? -1, node)
        )
          gate.reveal();
        onStoreChange();
      };
      if (gate.unsubscribeOptions !== null) {
        gate.unsubscribeOptions = manager.subscribe(updateOptions);
        if (manager.revision() !== preparedRevision) updateOptions();
      }
      onStoreChange();
      return () => {
        unsubscribeNode();
        gate.unsubscribeOptions?.();
        if (gate.unsubscribeOptions !== null)
          gate.unsubscribeOptions = undefined;
      };
    },
    [node, branch, manager, gate, preparedRevision],
  );
  const getRevision = useCallback(
    () => node.revision(TRACKING) + manager.revision(),
    [node, manager],
  );
  return useSyncExternalStore(subscribe, getRevision, getRevision);
};
