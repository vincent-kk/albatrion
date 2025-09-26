import {
  countKey,
  getEmptyObject,
  getFirstKey,
} from '@winglet/common-utils/object';

import type { Dictionary } from '@aileron/declare';

import { SIMPLE_EQUALITY_REGEX } from '../../../regex';

/**
 * Creates an optimized index factory for simple equality-based condition matching
 *
 * This function analyzes condition expressions to detect patterns where a single
 * dependency value directly maps to a schema index. When all conditions follow
 * the pattern `dependencies[n] === "value"`, it returns an O(1) lookup function
 * instead of evaluating JavaScript expressions at runtime.
 *
 * @param expressions - Array of JavaScript expression strings to analyze
 * @param schemaIndices - Array of schema indices corresponding to each expression
 * @returns Optimized lookup function if all expressions are simple equalities, null otherwise
 *
 * @example
 * // Input: ["dependencies[0] === 'email'", "dependencies[0] === 'phone'"]
 * // Returns: (deps) => deps[0] === 'email' ? 0 : deps[0] === 'phone' ? 1 : -1
 *
 * @example
 * // Input: ["dependencies[0] === 'a'", "true"] (mixed patterns)
 * // Returns: null (not optimizable)
 */
export const getSimpleEquality = (
  expressions: string[],
  schemaIndices: number[],
) => {
  const equalityDictionary = getEmptyObject<Dictionary<number>>();
  let invalid = false;
  for (let i = 0, l = expressions.length; i < l; i++) {
    if (expressions[i] === 'true') {
      invalid = true;
      break;
    }
    const matches = expressions[i].match(SIMPLE_EQUALITY_REGEX);
    if (matches === null) {
      invalid = true;
      break;
    }
    const index = matches[1];
    const value = matches[3];
    if (equalityDictionary[index] === undefined)
      equalityDictionary[index] = getEmptyObject();
    if (value in equalityDictionary[index]) continue;
    equalityDictionary[index][value] = schemaIndices[i];
  }

  if (invalid || countKey(equalityDictionary) > 1) return null;

  const dependencyIndex = Number(getFirstKey(equalityDictionary));
  const valueMap = equalityDictionary[dependencyIndex];
  return (dependencies: unknown[]) => {
    const value = dependencies[dependencyIndex];
    return typeof value === 'string' && value in valueMap
      ? valueMap[value]
      : -1;
  };
};
