import type { Dictionary } from '@aileron/declare';

import { hasOwnProperty } from '@/common-utils/libs/hasOwnProperty';
import { isArray } from '@/common-utils/utils/filter/isArray';
import { isObject } from '@/common-utils/utils/filter/isObject';
import { escapePointer } from '@/common-utils/utils/json/JSONPointer/utils/escapePointer';

export const getJSONPointer = <Root extends object, Target extends object>(
  root: Root,
  target: Target,
): string | null => {
  if (root === (target as unknown)) return '/';
  const pointer = getPointer(root, target);
  return pointer !== null ? `/${pointer}` : null;
};

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
          if (isObject(value)) stack.push([value, path]);
        }
      } else {
        for (const key in currentNode) {
          if (!hasOwnProperty(currentNode, key)) continue;
          const value = currentNode[key];
          const segments = escapePointer(key);
          const path = currentPath ? `${currentPath}/${segments}` : segments;
          if (value === target) return path;
          if (isObject(value)) stack.push([value, path]);
        }
      }
    }
  }
  return null;
};
