import { useLayoutEffect, useRef } from 'react';

import { useVersion } from '@winglet/react-utils/hook';

import { NodeEventType, type SchemaNode } from '@/schema-form/core';

/**
 * Controls rendering and focus/select behavior for form-type inputs based on SchemaNode events.
 *
 * Event Handling:
 * - `RequestRefresh`: Increments version to trigger component re-rendering
 * - `RequestFocus`: Focuses the first focusable element (input, textarea, button) in container
 * - `RequestSelect`: Selects text in the first selectable element (input, textarea) in container
 *
 * Usage in SchemaNodeInput:
 * - The returned version is used as:
 *   1. `key` prop for FormTypeInput to force remount on external value changes
 *   2. Dependency for `useMemorize` to recalculate defaultValue
 *
 * Design Note:
 * - RequestRefresh is only published when SetValueOption.Overwrite is used (external setValue)
 * - Normal user input (SetValueOption.Default) does NOT trigger RequestRefresh
 * - This prevents unnecessary remounts and preserves caret position during user typing
 *
 * @param node - The SchemaNode instance to subscribe to for events
 * @returns Tuple of [ref, version] - ref to attach to container element,
 *          version number that increments on RequestRefresh events
 */
export const useFormTypeInputControl = <Node extends SchemaNode>(
  node: Node,
) => {
  const [version, update] = useVersion();
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!node) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (type & NodeEventType.RequestRefresh) update();
      if (type & NodeEventType.RequestFocus) queryElement(ref.current)?.focus();
      if (type & NodeEventType.RequestSelect) {
        const element = queryElement(ref.current) as SelectableElement;
        if (element && typeof element.select === 'function') element.select();
      }
    });
    return unsubscribe;
  }, [node, ref, update]);
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
