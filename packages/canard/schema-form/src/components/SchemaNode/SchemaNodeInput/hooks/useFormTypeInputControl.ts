import { type RefObject, useLayoutEffect } from 'react';

import { useVersion } from '@winglet/react-utils/hook';

import { NodeEventType, type SchemaNode } from '@/schema-form/core';

/**
 * Controls focus and selection for form-type inputs during SchemaNode-driven updates.
 *
 * Rationale:
 * - In controlled inputs, some browsers move the caret to the tail when value is re-assigned.
 * - When value updates come from node event subscriptions (not immediate onChange setState),
 *   React's native caret preservation may not kick in. This hook captures selection around
 *   UpdateValue and restores it if the caret unexpectedly jumps to the end.
 * - IME composition is respected to avoid fighting with native composing behavior.
 *
 * Usage:
 * - Call from a component that owns a container ref wrapping the actual input element.
 * - Does not modify input components themselves.
 */
export const useFormTypeInputControl = <Node extends SchemaNode>(
  node: Node,
  containerRef: RefObject<HTMLElement | null>,
) => {
  const [version, update] = useVersion();
  useLayoutEffect(() => {
    if (!node) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (type & NodeEventType.RequestRefresh) update();
      if (type & NodeEventType.RequestFocus) {
        const element = queryElement(containerRef.current);
        if (element) element.focus();
      }
      if (type & NodeEventType.RequestSelect) {
        const element = queryElement(containerRef.current) as SelectableElement;
        if (element && typeof element.select === 'function') element.select();
      }
    });
    return unsubscribe;
  }, [node, containerRef, update]);

  return version;
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
