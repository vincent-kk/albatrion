import { isArray, isObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { escapeSegment } from '@/json/JSONPointer/utils/escape/escapeSegment';

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
  // RFC 6901 points at the whole document with the empty string; '/' addresses the
  // member whose key is the empty string, as JSONPointer.Root itself documents
  if (root === (target as unknown)) return JSONPointer.Root;
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
  // Identity against `target` is tested before a node is queued, so a node already
  // queued once can be skipped: cycles terminate and shared subtrees are walked once
  const visited = new WeakSet<object>([root]);
  while (stack.length > 0) {
    const [currentNode, currentPath] = stack.pop()!;
    if (isObject(currentNode)) {
      if (isArray(currentNode)) {
        for (let i = 0, l = currentNode.length; i < l; i++) {
          const value = currentNode[i];
          const segments = escapeSegment('' + i);
          const path = currentPath ? `${currentPath}/${segments}` : segments;
          if (value === target) return path;
          if (isObject(value) && !visited.has(value)) {
            visited.add(value);
            stack[stack.length] = [value, path] as const;
          }
        }
      } else {
        for (const key in currentNode) {
          if (!hasOwnProperty(currentNode, key)) continue;
          const value = currentNode[key];
          const segments = escapeSegment(key);
          const path = currentPath ? `${currentPath}/${segments}` : segments;
          if (value === target) return path;
          if (isObject(value) && !visited.has(value)) {
            visited.add(value);
            stack[stack.length] = [value, path] as const;
          }
        }
      }
    }
  }
  return null;
};
