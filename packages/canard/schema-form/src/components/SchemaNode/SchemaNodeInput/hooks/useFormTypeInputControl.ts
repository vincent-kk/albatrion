import { type MutableRefObject, useLayoutEffect, useRef } from 'react';

import { useVersion } from '@winglet/react-utils/hook';

import { type SchemaNode, SchemaNodeEventType } from '@/schema-form/core';

/**
 * Controls rendering and focus/select behavior for form-type inputs based on SchemaNode events.
 *
 * Event Handling:
 * - `RequestRefresh`: Increments version to trigger component re-rendering
 * - `RequestFocus`: Focuses the first focusable element (input, textarea, button) in container
 * - `RequestSelect`: Selects text in the first selectable element (input, textarea) in container
 *
 * Usage in SchemaNodeInput:
 * - The returned version keys the input and captures its current value.
 *
 * Design Note:
 * - Input-origin writes exclude their own Refresh through the core binding.
 * - A container with mounted child proxies preserves its input instance.
 *
 * @param node - The SchemaNode instance to subscribe to for events
 * @param mountedChildren - Count of committed child proxies owned by the input
 * @returns Tuple of [ref, version] - ref to attach to container element,
 *          version number that increments on RequestRefresh events
 */
export const useFormTypeInputControl = <Node extends SchemaNode>(
  node: Node,
  mountedChildren: MutableRefObject<number>,
) => {
  const [version, update] = useVersion();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!node) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (
        type & SchemaNodeEventType.RequestRefresh &&
        mountedChildren.current === 0
      )
        update();
      if (type & SchemaNodeEventType.RequestFocus)
        queryElement(ref.current)?.focus();
      if (type & SchemaNodeEventType.RequestSelect) {
        const element = queryElement(ref.current) as SelectableElement;
        if (element && typeof element.select === 'function') element.select();
      }
    });
    return unsubscribe;
  }, [node, ref, update, mountedChildren]);
  return [ref, version] as const;
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
