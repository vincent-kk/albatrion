import type { Dictionary } from '@aileron/declare';

import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';
import { isArray } from '@/common-utils/utils/filter/isArray';
import { isObject } from '@/common-utils/utils/filter/isObject';
import { escapePointer } from '@/common-utils/utils/json/JSONPointer/utils/escapePointer';

/**
 * 루트 객체에서 대상 객체까지의 JSON 포인터 경로를 생성합니다.
 * JSON 포인터는 RFC 6901 사양에 따른 문자열 형식입니다.
 *
 * @template Root - 루트 객체 타입
 * @template Target - 대상 객체 타입
 * @param root - 탐색을 시작할 루트 객체
 * @param target - 찾고자 하는 대상 객체
 * @returns 대상 객체에 대한 JSON 포인터 문자열 또는 찾지 못한 경우 null
 *
 * @example
 * const obj = { a: { b: [1, 2, { c: 'found' }] } };
 * getJSONPointer(obj, obj.a.b[2]); // '/a/b/2'
 */
export const getJSONPointer = <Root extends object, Target extends object>(
  root: Root,
  target: Target,
): string | null => {
  if (root === (target as unknown)) return '/';
  const pointer = getPointer(root, target);
  return pointer !== null ? `/${pointer}` : null;
};

/**
 * 루트 객체에서 대상 값까지의 경로를 깊이 우선 탐색으로 찾습니다.
 *
 * @param root - 탐색을 시작할 루트 객체
 * @param target - 찾고자 하는 대상 값
 * @returns 대상에 대한 경로 문자열 또는 찾지 못한 경우 null
 */
const getPointer = (
  root: Dictionary | any[],
  target: unknown,
): string | null => {
  const stack: [current: Dictionary | any[], path: string][] = [[root, '']];
  while (stack.length > 0) {
    const [currentNode, currentPath] = stack.pop()!;
    if (isObject(currentNode)) {
      if (isArray(currentNode)) {
        for (let index = 0; index < currentNode.length; index++) {
          const value = currentNode[index];
          const segments = escapePointer('' + index);
          const path = currentPath ? `${currentPath}/${segments}` : segments;
          if (value === target) return path;
          if (isObject(value)) stack[stack.length] = [value, path] as const;
        }
      } else {
        for (const key in currentNode) {
          if (!hasOwnProperty(currentNode, key)) continue;
          const value = currentNode[key];
          const segments = escapePointer(key);
          const path = currentPath ? `${currentPath}/${segments}` : segments;
          if (value === target) return path;
          if (isObject(value)) stack[stack.length] = [value, path] as const;
        }
      }
    }
  }
  return null;
};
