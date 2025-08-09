import { type RefObject, useLayoutEffect, useRef } from 'react';

import { isFunction } from '@winglet/common-utils/filter';
import { useVersion } from '@winglet/react-utils/hook';

import { NodeEventType, type SchemaNode } from '@/schema-form/core';

/**
 * Hook that controls input elements connected to schema nodes.
 * Manages focus or selection state based on events.
 * @param node - Node to connect with input elements
 * @returns [version, ref]
 */
export const useSchemaNodeInputControl = <Node extends SchemaNode>(
  node: Node | null,
) => {
  const ref = useRef<HTMLElement>(null);
  const [version, update] = useVersion();
  useLayoutEffect(() => {
    if (node === null) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (type & NodeEventType.RequestRedraw) update();
      if (type & NodeEventType.RequestFocus) getInputElement(ref)?.focus?.();
      if (type & NodeEventType.RequestSelect) {
        const element = getInputElement(ref);
        if (element && 'select' in element && isFunction(element.select))
          element.select();
      }
    });
    return unsubscribe;
  }, [node, update]);
  return [version, ref] as const;
};

const DOM_SELECTOR = ['input[type=text]', 'input', 'button'] as const;

/**
 * Finds input elements within the specified ref.
 * Returns the first valid input element found in selector order.
 * @param ref - Reference to the parent element
 * @returns Found input element or null
 */
const getInputElement = (ref: RefObject<HTMLElement | null>) => {
  for (const selector of DOM_SELECTOR) {
    const target = ref.current?.querySelector(selector);
    if (
      target instanceof HTMLElement &&
      window.getComputedStyle(target).display !== 'none'
    ) {
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLButtonElement
      ) {
        return target;
      }
    }
  }
  return null;
};
