import {
  JSONPointer as $,
  PointerOperator,
  parsePointer,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import { replaceExpressionPaths } from '../../../utils/expressions/replaceExpressionPaths';

/**
 * Preserve the host-independent part of every expression node read.
 * @param condition - Authored active expression or nonexpression condition
 * @returns Absolute paths and relative parent-climb counts in expression order
 */
export const collectGateEvaluationReads = (
  condition: unknown,
): readonly (string | number)[] => {
  // eslint-disable-next-line no-restricted-syntax -- Per-gate ownership; evaluationReads arrays are compared by reference.
  if (typeof condition !== 'string') return Object.freeze([]);
  const reads: (string | number)[] = [];
  replaceExpressionPaths(condition, (path) => {
    const parsed = parsePointer(path);
    if (parsed.segments[0] === PointerOperator.Context) return path;
    if (parsed.isAbsolute) reads.push(resolvePointer($.Root, path));
    else {
      let levels = 0;
      for (const segment of parsed.segments) {
        if (segment !== PointerOperator.Parent) break;
        levels++;
      }
      reads.push(levels);
    }
    return path;
  });
  return Object.freeze(reads);
};
