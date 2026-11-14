import {
  type RefObject,
  useCallback,
  useRef,
  useSyncExternalStore,
} from 'react';

import { useTruthyConstant, useVersion } from '@winglet/react-utils/hook';

import type { Fn, Optional } from '@aileron/declare';

import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_MASK_NONE,
} from '@/schema-form/constants/bitmask';
import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';

import { REACTIVE_RERENDERING_EVENTS } from '../type';
import { readFieldInputGeneration } from '../utils/readFieldInputGeneration';

/** Input props, child lists and applied Refresh share one delivery snapshot. */
const INPUT_TRACKING_EVENTS =
  REACTIVE_RERENDERING_EVENTS |
  FieldNodeEventType.UpdateChildren |
  FieldNodeEventType.RequestRefresh;

/** Keep input props and children current while the applied Refresh generation is deferred. */
const INPUT_TRACKING_EVENTS_WITHOUT_REFRESH =
  INPUT_TRACKING_EVENTS & ~FieldNodeEventType.RequestRefresh;

/** Refresh waits while the raw input owns an active IME composition. */
const COMPOSING = BIT_FLAG_00;
/** Mask that clears the composing bit from the refresh deferral state. */
const CLEAR_COMPOSING_MASK = ~COMPOSING;
/** Refresh waits for the child ownership observed by render, subscribe or delivery. */
const MOUNTED_CHILDREN = BIT_FLAG_01;

/**
 * Controls rendering and composition deferral for field inputs based on FieldNode events.
 *
 * Event Handling:
 * - `REACTIVE_RERENDERING_EVENTS | UpdateChildren`: Re-renders the caller through the shared snapshot
 * - `RequestRefresh`: Tracks the generation the `controlled` declaration selects, deferring replacement until composition ends
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
 * @param controlled - Combined declaration; only `true` stops Refresh from replacing the input
 * @returns Container ref, input key, composition handlers, stable re-render dispatch and composition cleanup
 */
export const useFieldInputControl = <Node extends FieldNode>(
  node: Node,
  mountedChildren: RefObject<number>,
  controlled?: Optional<boolean>,
) => {
  const refreshRevision = readFieldInputGeneration(node, controlled);
  const generation = useRef(refreshRevision);

  const [, update] = useVersion();
  const ref = useRef<HTMLDivElement>(null);
  const refreshDeferral = useTruthyConstant(createRefreshDeferral);
  refreshDeferral.current =
    (refreshDeferral.current & COMPOSING) |
    (mountedChildren.current > 0 ? MOUNTED_CHILDREN : BIT_MASK_NONE);
  const subscribe = useCallback(
    (onStoreChange: Fn) => {
      refreshDeferral.current =
        (refreshDeferral.current & COMPOSING) |
        (mountedChildren.current > 0 ? MOUNTED_CHILDREN : BIT_MASK_NONE);
      const unsubscribe = node.subscribe(({ type }) => {
        if (
          !(type & INPUT_TRACKING_EVENTS) &&
          (!(
            type &
            (FieldNodeEventType.UpdateError | FieldNodeEventType.UpdateState)
          ) ||
            generation.current === readFieldInputGeneration(node, controlled))
        )
          return;
        refreshDeferral.current =
          (refreshDeferral.current & COMPOSING) |
          (mountedChildren.current > 0 ? MOUNTED_CHILDREN : BIT_MASK_NONE);
        onStoreChange();
      });
      onStoreChange();
      return unsubscribe;
    },
    [node, mountedChildren, refreshDeferral, controlled],
  );
  const getRevision = useCallback(() => {
    // revision(mask) sums per-bit delivery counts, so each undeferred read equals
    // the Refresh-excluded revision plus the declaration's current generation.
    if (refreshDeferral.current !== BIT_MASK_NONE)
      return (
        node.revision(INPUT_TRACKING_EVENTS_WITHOUT_REFRESH) +
        generation.current
      );
    return node.revision(
      controlled === true
        ? INPUT_TRACKING_EVENTS_WITHOUT_REFRESH
        : INPUT_TRACKING_EVENTS,
    );
  }, [node, refreshDeferral, controlled]);
  useSyncExternalStore(subscribe, getRevision, getRevision);
  if (refreshDeferral.current === BIT_MASK_NONE)
    generation.current = refreshRevision;
  const handleCompositionStart = useCallback(() => {
    refreshDeferral.current |= COMPOSING;
  }, [refreshDeferral]);
  const handleCompositionEnd = useCallback(() => {
    refreshDeferral.current &= CLEAR_COMPOSING_MASK;
    if (
      mountedChildren.current === 0 &&
      generation.current !== readFieldInputGeneration(node, controlled)
    )
      update();
  }, [mountedChildren, node, update, refreshDeferral, controlled]);
  return [
    ref,
    generation.current,
    handleCompositionStart,
    handleCompositionEnd,
    update,
    refreshDeferral.release,
  ] as const;
};

/**
 * Retain composition cleanup with its always-present deferral cell.
 * @returns A fresh cell whose cleanup preserves the child-ownership bit.
 */
const createRefreshDeferral = () => {
  const deferral = {
    current: BIT_MASK_NONE,
    release: () => {
      deferral.current &= CLEAR_COMPOSING_MASK;
    },
  };
  return deferral;
};
