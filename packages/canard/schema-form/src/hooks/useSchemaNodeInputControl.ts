import { type RefObject, useLayoutEffect, useRef } from 'react';

import { isFunction } from '@winglet/common-utils';
import { useVersion } from '@winglet/react-utils';

import { NodeEventType, type SchemaNode } from '@/schema-form/core';

/**
 * 스키마 노드에 연결된 입력 요소를 제어하는 훅입니다.
 * 이벤트에 따라 포커스나 선택 상태를 조절합니다.
 * @param node - 입력 요소와 연결할 노드
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
      if (type & NodeEventType.Redraw) update();
      if (type & NodeEventType.Focus) getInputElement(ref)?.focus?.();
      if (type & NodeEventType.Select) {
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
 * 지정된 ref에서 입력 요소를 찾습니다.
 * 선택자 순서대로 유효한 입력 요소를 찾아 반환합니다.
 * @param ref - 부모 요소의 참조
 * @returns 찾은 입력 요소 또는 null
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
