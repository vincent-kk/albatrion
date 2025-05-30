import type { Dictionary } from '@aileron/declare';

import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';
import { isArray } from '@/common-utils/utils/filter/isArray';
import { isObject } from '@/common-utils/utils/filter/isObject';
import { escapePointer } from '@/common-utils/utils/json/JSONPointer/utils/escape/escapePointer';

/**
 * Generates a JSON Pointer path from the root object to the target object.
 * JSON Pointer is a string format according to RFC 6901 specification.
 *
 * @template Root - Root object type
 * @template Target - Target object type
 * @param root - Root object to start the search from
 * @param target - Target object to find
 * @returns JSON Pointer string to the target object or null if not found
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
 * Finds the path from the root object to the target value using depth-first search.
 *
 * @param root - Root object to start the search from
 * @param target - Target value to find
 * @returns Path string to the target or null if not found
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
