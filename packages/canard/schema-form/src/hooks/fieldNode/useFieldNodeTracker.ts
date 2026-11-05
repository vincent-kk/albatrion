import { useCallback, useSyncExternalStore } from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import type { Fn, Nullish } from '@aileron/declare';

import { BIT_MASK_ALL } from '@/schema-form/constants/bitmask';
import type { FieldNode } from '@/schema-form/core';

/**
 * Re-renders the component whenever the node delivers events matching the mask.
 *
 * Implemented with `useSyncExternalStore` over the node's delivery ledger
 * (`node.revision(mask)`), which makes it safe under React concurrent
 * rendering by contract: under a concurrent mount (Suspense retry /
 * transition) synchronous node delivery can occur in the
 * gap between the render phase and the commit phase — before any subscription
 * exists. React re-checks the snapshot at commit and forces a resync render
 * when it diverged, so deliveries in that gap are never lost.
 * The subscription also checks on every attach, including Activity reconnects
 * after a render with an unchanged snapshot.
 *
 * Prefer this hook (plus reading node getters during render) over manually
 * mirroring node state from a `node.subscribe` listener — a manual mirror
 * silently misses pre-subscription deliveries unless it also implements
 * catch-up (see `useFieldNodeSubscribe`'s `onSubscribe` option).
 *
 * @param node - FieldNode to track; null or undefined creates no subscription
 * @param tracking - Bitmask of `FieldNodeEventType`s that trigger a re-render
 *                   (defaults to all events)
 * @returns Current node's revision of matching deliveries — usable as a dependency
 *          or key that changes with every tracked delivery; 0 without a node
 */
export const useFieldNodeTracker = <
  Node extends {
    subscribe(listener: Parameters<FieldNode['subscribe']>[0]): Fn;
    revision(mask?: number): number;
  },
>(
  node: Node | Nullish,
  tracking: number = BIT_MASK_ALL,
): number => {
  const subscribe = useCallback(
    (onStoreChange: Fn) => {
      if (node == null) return NOOP_FUNCTION;
      const unsubscribe = node.subscribe(({ type }) => {
        if (type & tracking) onStoreChange();
      });
      onStoreChange();
      return unsubscribe;
    },
    [node, tracking],
  );
  const getRevision = useCallback(
    () => (node == null ? 0 : node.revision(tracking)),
    [node, tracking],
  );
  return useSyncExternalStore(subscribe, getRevision, getRevision);
};
