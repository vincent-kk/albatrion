import { useCallback, useSyncExternalStore } from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import type { Fn } from '@aileron/declare';

import { BIT_MASK_ALL } from '@/schema-form/app/constants';
import type { SchemaNode, UnionNodeEventType } from '@/schema-form/core';

/**
 * Re-renders the component whenever the node delivers events matching the mask.
 *
 * Implemented with `useSyncExternalStore` over the node's delivery ledger
 * (`node.revision(mask)`), which makes it safe under React concurrent
 * rendering by contract: node events are microtask-batched, so under a
 * concurrent mount (Suspense retry / transition) the cascade can drain in the
 * gap between the render phase and the commit phase — before any subscription
 * exists. React re-checks the snapshot at commit and forces a resync render
 * when it diverged, so deliveries in that gap are never lost.
 *
 * Prefer this hook (plus reading node getters during render) over manually
 * mirroring node state from a `node.subscribe` listener — a manual mirror
 * silently misses pre-subscription deliveries unless it also implements
 * catch-up (see `useSchemaNodeSubscribe`'s `onSubscribe` option).
 *
 * @param node - SchemaNode to track (null is allowed and tracks nothing)
 * @param tracking - Bitmask of `NodeEventType`s that trigger a re-render
 *                   (defaults to all events)
 * @returns Monotonic revision of matching deliveries — usable as a dependency
 *          or key that changes with every tracked delivery
 */
export const useSchemaNodeTracker = <Node extends SchemaNode>(
  node: Node | null,
  tracking: UnionNodeEventType = BIT_MASK_ALL,
): number => {
  const subscribe = useCallback(
    (onStoreChange: Fn) => {
      if (node === null) return NOOP_FUNCTION;
      return node.subscribe(({ type }) => {
        if (type & tracking) onStoreChange();
      });
    },
    [node, tracking],
  );
  const getRevision = useCallback(
    () => (node === null ? 0 : node.revision(tracking)),
    [node, tracking],
  );
  return useSyncExternalStore(subscribe, getRevision, getRevision);
};
