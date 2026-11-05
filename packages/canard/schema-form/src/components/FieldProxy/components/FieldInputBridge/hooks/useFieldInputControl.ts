import {
  type RefObject,
  useCallback,
  useRef,
  useSyncExternalStore,
} from 'react';

import { useVersion } from '@winglet/react-utils/hook';

import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';

import { REACTIVE_RERENDERING_EVENTS } from '../type';

/** Input props, child lists and applied Refresh share one delivery snapshot. */
const INPUT_TRACKING_EVENTS =
  REACTIVE_RERENDERING_EVENTS |
  FieldNodeEventType.UpdateChildren |
  FieldNodeEventType.RequestRefresh;

/** Keep input props and children current while the applied Refresh generation is deferred. */
const INPUT_TRACKING_EVENTS_WITHOUT_REFRESH =
  INPUT_TRACKING_EVENTS & ~FieldNodeEventType.RequestRefresh;

/** Refresh waits while the raw input owns an active IME composition. */
const COMPOSING = 1;
/** Mask that clears the composing bit from the refresh deferral state. */
const CLEAR_COMPOSING_MASK = ~COMPOSING;
/** Refresh waits for the child ownership observed by render, subscribe or delivery. */
const MOUNTED_CHILDREN = 2;

/**
 * Controls rendering and composition deferral for field inputs based on FieldNode events.
 *
 * Event Handling:
 * - `REACTIVE_RERENDERING_EVENTS | UpdateChildren`: Re-renders the caller through the shared snapshot
 * - `RequestRefresh`: Tracks the node revision, deferring replacement until composition ends
 *
 * Usage in FieldInputBridge:
 * - The returned generation keys the input and captures its current value.
 *
 * Design Note:
 * - Input-origin writes exclude their own Refresh through the core binding.
 * - A container with mounted child proxies preserves its input instance.
 * - Layout disconnection ends composition so reconnect can apply missed Refresh
 *   without waiting for a compositionend event from a hidden input.
 * - Each subscription checks the snapshot on attach, including Activity reconnects
 *   after a render with an unchanged revision.
 *
 * @param node - The FieldNode instance to subscribe to for events
 * @param mountedChildren - Count of committed child proxies owned by the input
 * @returns Container ref, input key, composition handlers and stable re-render dispatch shared with held-display releases, and composition cleanup
 */
export const useFieldInputControl = <Node extends FieldNode>(
  node: Node,
  mountedChildren: RefObject<number>,
) => {
  const generation = useRef(node.revision(FieldNodeEventType.RequestRefresh));

  const [, update] = useVersion();
  const ref = useRef<HTMLDivElement>(null);
  const refreshDeferral = useRef(0);
  refreshDeferral.current =
    (refreshDeferral.current & COMPOSING) |
    (mountedChildren.current > 0 ? MOUNTED_CHILDREN : 0);
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      refreshDeferral.current =
        (refreshDeferral.current & COMPOSING) |
        (mountedChildren.current > 0 ? MOUNTED_CHILDREN : 0);
      const unsubscribe = node.subscribe(({ type }) => {
        if (!(type & INPUT_TRACKING_EVENTS)) return;
        refreshDeferral.current =
          (refreshDeferral.current & COMPOSING) |
          (mountedChildren.current > 0 ? MOUNTED_CHILDREN : 0);
        onStoreChange();
      });
      onStoreChange();
      return unsubscribe;
    },
    [node, mountedChildren],
  );
  const getRevision = useCallback(() => {
    // revision(mask) sums per-bit delivery counts, so the combined read equals
    // the Refresh-excluded revision plus the current Refresh revision.
    if (refreshDeferral.current === 0)
      return node.revision(INPUT_TRACKING_EVENTS);
    return (
      node.revision(INPUT_TRACKING_EVENTS_WITHOUT_REFRESH) + generation.current
    );
  }, [node]);
  useSyncExternalStore(subscribe, getRevision, getRevision);
  if (refreshDeferral.current === 0)
    generation.current = node.revision(FieldNodeEventType.RequestRefresh);
  const handleCompositionStart = useCallback(() => {
    refreshDeferral.current |= COMPOSING;
  }, []);
  const handleCompositionEnd = useCallback(() => {
    refreshDeferral.current &= CLEAR_COMPOSING_MASK;
    if (
      mountedChildren.current === 0 &&
      generation.current !== node.revision(FieldNodeEventType.RequestRefresh)
    )
      update();
  }, [mountedChildren, node, update]);
  const releaseComposition = useCallback(() => {
    refreshDeferral.current &= CLEAR_COMPOSING_MASK;
  }, []);
  return [
    ref,
    generation.current,
    handleCompositionStart,
    handleCompositionEnd,
    update,
    releaseComposition,
  ] as const;
};
