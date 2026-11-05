import {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

import { useVersion } from '@winglet/react-utils/hook';

import type { Nullable } from '@aileron/declare';

import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';
import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';

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
 * - `RequestFocus`: Focuses the first focusable element (input, textarea, select, button) in container
 * - `RequestSelect`: Selects text in the first selectable element (input, textarea) in container
 *
 * Usage in FieldInputSlot:
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
 * @param commitTerminalChildren - Commit marker from `useTerminalChildren`; the focus/select layout
 *        effect calls it first, so the input keeps a single layout effect of its own
 * @param hydrationCommitRef - Hydration detector to settle in that same layout
 *        effect before React checks the server snapshot in its passive phase
 * @param virtualizationManager - Records this slot's node only when a real
 *        input is present; hidden proxies and placeholders never own this commit
 * @returns Container ref, input key, composition handlers and stable re-render dispatch shared with held-display releases
 */
export const useFieldInputControl = <Node extends FieldNode>(
  node: Node,
  mountedChildren: RefObject<number>,
  commitTerminalChildren: () => void,
  hydrationCommitRef?: RefObject<boolean>,
  virtualizationManager?: VirtualizationManager | null,
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
  useLayoutEffect(() => {
    commitTerminalChildren();
    if (hydrationCommitRef) hydrationCommitRef.current = true;
    virtualizationManager?.markRevealed(node);
    if (!node) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (type & FieldNodeEventType.RequestFocus)
        queryElement(ref.current, FOCUS_SELECTOR)?.focus();
      if (type & FieldNodeEventType.RequestSelect) {
        const element = queryElement(
          ref.current,
          SELECT_SELECTOR,
        ) as SelectableElement;
        if (element && typeof element.select === 'function') element.select();
      }
    });
    return () => {
      refreshDeferral.current &= CLEAR_COMPOSING_MASK;
      unsubscribe();
    };
  }, [
    node,
    ref,
    commitTerminalChildren,
    hydrationCommitRef,
    virtualizationManager,
  ]);
  return [
    ref,
    generation.current,
    handleCompositionStart,
    handleCompositionEnd,
    update,
  ] as const;
};

/** Focus targets, in document order: every native control, `<select>` included. */
const FOCUS_SELECTOR = 'input, textarea, select, button' as const;

/** Select targets: only controls whose text `select()` can select, so a leading button or `<select>` is passed over. */
const SELECT_SELECTOR = 'input, textarea' as const;

/** Elements whose text `select()` can select. */
type SelectableElement = HTMLInputElement | HTMLTextAreaElement;
/** Elements a Focus or Select request can reach. */
type FocusableElement =
  | SelectableElement
  | HTMLSelectElement
  | HTMLButtonElement;

/**
 * Find the first element matching a request's selector inside an input container.
 * @param container - The slot's container element; null before mount.
 * @param selector - {@link FOCUS_SELECTOR} or {@link SELECT_SELECTOR}.
 * @returns The first match in document order, or null.
 */
const queryElement = (
  container: Nullable<HTMLElement>,
  selector: string,
): Nullable<FocusableElement> => {
  if (!container) return null;
  return container.querySelector<FocusableElement>(selector) ?? null;
};
