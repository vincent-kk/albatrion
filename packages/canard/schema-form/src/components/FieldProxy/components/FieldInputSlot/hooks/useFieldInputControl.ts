import {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useReducer,
  useRef,
  useSyncExternalStore,
} from 'react';

import type { Nullable } from '@aileron/declare';

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
 * Controls rendering and focus/select behavior for field inputs based on FieldNode events.
 *
 * Event Handling:
 * - `REACTIVE_RERENDERING_EVENTS | UpdateChildren`: Re-renders the caller through the shared snapshot
 * - `RequestRefresh`: Tracks the node revision, deferring replacement until composition ends
 * - `RequestFocus`: Focuses the first focusable element (input, textarea, button) in container
 * - `RequestSelect`: Selects text in the first selectable element (input, textarea) in container
 *
 * Usage in FieldInputSlot:
 * - The returned generation keys the input and captures its current value.
 *
 * Design Note:
 * - Input-origin writes exclude their own Refresh through the core binding.
 * - A container with mounted child proxies preserves its input instance.
 *
 * @param node - The FieldNode instance to subscribe to for events
 * @param mountedChildren - Count of committed child proxies owned by the input
 * @param commitTerminalChildren - Commit marker from `useTerminalChildren`; the focus/select layout
 *        effect calls it first, so the input keeps a single layout effect of its own
 * @returns Container ref, input key and composition handlers that preserve the composing input
 */
export const useFieldInputControl = <Node extends FieldNode>(
  node: Node,
  mountedChildren: RefObject<number>,
  commitTerminalChildren: () => void,
) => {
  const generation = useRef(node.revision(FieldNodeEventType.RequestRefresh));
  const [, releaseComposition] = useReducer((value: number) => value + 1, 0);
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
      return node.subscribe(({ type }) => {
        if (!(type & INPUT_TRACKING_EVENTS)) return;
        refreshDeferral.current =
          (refreshDeferral.current & COMPOSING) |
          (mountedChildren.current > 0 ? MOUNTED_CHILDREN : 0);
        onStoreChange();
      });
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
      releaseComposition();
  }, [node, mountedChildren]);
  useLayoutEffect(() => {
    commitTerminalChildren();
    if (!node) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (type & FieldNodeEventType.RequestFocus)
        queryElement(ref.current)?.focus();
      if (type & FieldNodeEventType.RequestSelect) {
        const element = queryElement(ref.current) as SelectableElement;
        if (element && typeof element.select === 'function') element.select();
      }
    });
    return unsubscribe;
  }, [node, ref, commitTerminalChildren]);
  return [
    ref,
    generation.current,
    handleCompositionStart,
    handleCompositionEnd,
  ] as const;
};

const FOCUS_SELECT_SELECTOR = 'input, textarea, button' as const;

type SelectableElement = HTMLInputElement | HTMLTextAreaElement;
type FocusableElement = SelectableElement | HTMLButtonElement;

const queryElement = (
  container: Nullable<HTMLElement>,
): Nullable<FocusableElement> => {
  if (!container) return null;
  const element = container.querySelector<FocusableElement>(
    FOCUS_SELECT_SELECTOR,
  );
  return element ?? null;
};
