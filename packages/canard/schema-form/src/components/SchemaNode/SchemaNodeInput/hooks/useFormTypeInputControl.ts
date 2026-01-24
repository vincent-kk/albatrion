import { useLayoutEffect, useRef } from 'react';

import { NodeEventType, type SchemaNode } from '@/schema-form/core';

/**
 * Hook that controls focus and select behavior for form inputs based on SchemaNode events.
 *
 * Behavior:
 * - `RequestFocus` event: Focuses the first focusable element (input, textarea, button) within the container
 * - `RequestSelect` event: Selects all text in the first selectable element (input, textarea) within the container
 *
 * Usage:
 * - Attach the returned ref to a container element wrapping the input
 * - Example: `<span ref={containerRef}><input ... /></span>`
 *
 * @param node - The SchemaNode instance to subscribe to for events
 * @returns A ref object to attach to the container element
 */
export const useFormTypeInputControl = <Node extends SchemaNode>(
  node: Node,
) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!node) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (type & NodeEventType.RequestFocus)
        queryElement(containerRef.current)?.focus();
      if (type & NodeEventType.RequestSelect) {
        const element = queryElement(containerRef.current) as SelectableElement;
        if (element && typeof element.select === 'function') element.select();
      }
    });
    return unsubscribe;
  }, [node, containerRef]);
  return containerRef;
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
