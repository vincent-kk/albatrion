import { type RefObject, useLayoutEffect, useRef } from 'react';

import { MethodType, type SchemaNode } from '@lumy/schema-form/core';
import { isFunction } from '@lumy/schema-form/helpers/filter';

import { useTick } from './useTick';

export function useSchemaNodeListener<Node extends SchemaNode>(
  node: Node | null,
) {
  const ref = useRef<HTMLElement>(null);
  const [tick, update] = useTick();

  useLayoutEffect(() => {
    if (node === null) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (type === MethodType.Redraw) {
        update();
      } else if (type === MethodType.Focus) {
        getInputElement(ref)?.focus?.();
      } else if (type === MethodType.Select) {
        const element = getInputElement(ref);
        if (element && 'select' in element && isFunction(element.select)) {
          element.select();
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, [node, update]);

  return [tick, ref] as const;
}

const DOM_SELECTOR = ['input[type=text]', 'input', 'button'] as const;
const getInputElement = (ref: RefObject<HTMLElement>) => {
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
