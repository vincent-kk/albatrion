import {
  type MutableRefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import { type SchemaNode, SchemaNodeEventType } from '@/schema-form/core';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';

/**
 * Controls rendering and focus/select behavior for form-type inputs based on SchemaNode events.
 *
 * Event Handling:
 * - `RequestRefresh`: Tracks the node revision, deferring replacement until composition ends
 * - `RequestFocus`: Focuses the first focusable element (input, textarea, button) in container
 * - `RequestSelect`: Selects text in the first selectable element (input, textarea) in container
 *
 * Usage in SchemaNodeInput:
 * - The returned generation keys the input and captures its current value.
 *
 * Design Note:
 * - Input-origin writes exclude their own Refresh through the core binding.
 * - A container with mounted child proxies preserves its input instance.
 *
 * @param node - The SchemaNode instance to subscribe to for events
 * @param mountedChildren - Count of committed child proxies owned by the input
 * @returns Container ref, input key and composition handlers that preserve the composing input
 */
export const useFormTypeInputControl = <Node extends SchemaNode>(
  node: Node,
  mountedChildren: MutableRefObject<number>,
) => {
  const generation = useRef(node.revision(SchemaNodeEventType.RequestRefresh));
  const [, releaseComposition] = useReducer((value: number) => value + 1, 0);
  const ref = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const refreshSource = useMemo(
    () => ({
      subscribe: (listener: Parameters<Node['subscribe']>[0]) =>
        node.subscribe(listener),
      revision: (tracking?: number) =>
        composing.current || mountedChildren.current > 0
          ? generation.current
          : node.revision(tracking),
    }),
    [node, mountedChildren],
  );
  generation.current = useSchemaNodeTracker(
    refreshSource,
    SchemaNodeEventType.RequestRefresh,
  );
  const handleCompositionStart = useCallback(() => {
    composing.current = true;
  }, []);
  const handleCompositionEnd = useCallback(() => {
    composing.current = false;
    if (
      mountedChildren.current === 0 &&
      generation.current !== node.revision(SchemaNodeEventType.RequestRefresh)
    )
      releaseComposition();
  }, [node, mountedChildren]);
  useLayoutEffect(() => {
    if (!node) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (type & SchemaNodeEventType.RequestFocus)
        queryElement(ref.current)?.focus();
      if (type & SchemaNodeEventType.RequestSelect) {
        const element = queryElement(ref.current) as SelectableElement;
        if (element && typeof element.select === 'function') element.select();
      }
    });
    return unsubscribe;
  }, [node, ref]);
  return [ref, generation.current, handleCompositionStart, handleCompositionEnd] as const;
};

const FOCUS_SELECT_SELECTOR = 'input, textarea, button' as const;

type SelectableElement = HTMLInputElement | HTMLTextAreaElement;
type FocusableElement = SelectableElement | HTMLButtonElement;

const queryElement = (
  container: HTMLElement | null,
): FocusableElement | null => {
  if (!container) return null;
  const element = container.querySelector<FocusableElement>(
    FOCUS_SELECT_SELECTOR,
  );
  return element ?? null;
};
