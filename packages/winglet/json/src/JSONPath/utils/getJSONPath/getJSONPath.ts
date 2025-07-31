import { isArray, isObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

// 상수 분리
const JSON_PATH_ROOT = '$';
const DOT = '.';
const BRACKET_OPEN = '[';
const BRACKET_CLOSE = ']';
const QUOTE = "'";

/**
 * Determines if a property key needs bracket notation in JSONPath.
 * Keys containing dots require bracket notation.
 *
 * @param key - Property key to check
 * @returns true if bracket notation is needed, false otherwise
 */
const needsBracketNotation = (key: string): boolean => key.indexOf(DOT) !== -1;

/**
 * Generates a JSONPath from the root object to the target object.
 * JSONPath is a query language for JSON similar to XPath for XML.
 *
 * @template Root - Root object type
 * @template Target - Target object type
 * @param root - Root object to start the search from
 * @param target - Target object to find
 * @returns JSONPath string to the target object or null if not found
 *
 * @example
 * const obj = { a: { b: [1, 2, { c: 'found' }] } };
 * getJSONPath(obj, obj.a.b[2]); // '$.a.b[2]'
 *
 * @example
 * const obj = { 'key.with.dots': { value: 'found' } };
 * getJSONPath(obj, obj['key.with.dots']); // "$['key.with.dots']"
 */
export const getJSONPath = <Root extends object, Target>(
  root: Root,
  target: Target,
): string | null => {
  if (root === (target as unknown)) return JSON_PATH_ROOT;
  const pathSegments = getJSONPathSegments(root, target);
  return pathSegments !== null ? `${JSON_PATH_ROOT}${pathSegments}` : null;
};

/**
 * Finds the path segments from the root object to the target value using depth-first search.
 *
 * @param root - Root object to start the search from
 * @param target - Target value to find
 * @returns Path segments string to the target or null if not found
 */
const getJSONPathSegments = (
  root: Dictionary | any[],
  target: unknown,
): string | null => {
  const stack: [current: Dictionary | any[], path: string][] = [[root, '']];

  while (stack.length > 0) {
    const [currentNode, currentPath] = stack.pop()!;

    if (isObject(currentNode)) {
      if (isArray(currentNode)) {
        // 배열의 경우 인덱스를 [index] 형식으로 처리
        for (let i = 0, l = currentNode.length; i < l; i++) {
          const value = currentNode[i];
          const segment = `${BRACKET_OPEN}${i}${BRACKET_CLOSE}`;
          const path = currentPath + segment;

          if (value === target) return path;
          if (isObject(value)) stack[stack.length] = [value, path] as const;
        }
      } else {
        // 객체의 경우 키에 따라 .key 또는 ['key'] 형식으로 처리
        for (const key in currentNode) {
          if (!hasOwnProperty(currentNode, key)) continue;

          const value = currentNode[key];
          const segment = needsBracketNotation(key)
            ? `${BRACKET_OPEN}${QUOTE}${key}${QUOTE}${BRACKET_CLOSE}`
            : `${DOT}${key}`;
          const path = currentPath + segment;

          if (value === target) return path;
          if (isObject(value)) stack[stack.length] = [value, path] as const;
        }
      }
    }
  }

  return null;
};
