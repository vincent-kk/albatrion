import {
  JSONPointer as $,
  PointerOperator,
  parsePointer,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import { JSON_POINTER_PATH_REGEX } from '../../../utils/expressions/regex';

/**
 * Preserve the host-independent part of every expression node read.
 * @param condition - Authored active expression or nonexpression condition
 * @returns Absolute paths and relative parent-climb counts in expression order
 */
export const collectGateEvaluationReads = (
  condition: unknown,
): readonly (string | number)[] => {
  if (typeof condition !== 'string') return Object.freeze([]);
  const reads: (string | number)[] = [];
  for (const match of condition.matchAll(JSON_POINTER_PATH_REGEX)) {
    const path = match[0];
    const parsed = parsePointer(path);
    if (parsed.segments[0] === PointerOperator.Context) continue;
    if (parsed.absolute) reads.push(resolvePointer($.Root, path));
    else {
      let levels = 0;
      for (const segment of parsed.segments) {
        if (segment !== PointerOperator.Parent) break;
        levels++;
      }
      reads.push(levels);
    }
  }
  return Object.freeze(reads);
};
