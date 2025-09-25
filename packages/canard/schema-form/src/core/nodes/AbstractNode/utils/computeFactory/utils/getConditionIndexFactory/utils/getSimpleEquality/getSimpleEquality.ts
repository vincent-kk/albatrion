import {
  countKey,
  getEmptyObject,
  getFirstKey,
} from '@winglet/common-utils/object';

import type { Dictionary } from '@aileron/declare';

/**
 * Regular expression pattern for simple equality comparison
 * @example Matches expressions in the form dependencies[n] === "value"
 */
const SIMPLE_EQUALITY_REGEX =
  /^\s*dependencies\[(\d+)\]\s*===\s*(['"])([^'"]+)\2\s*$/;

export const getSimpleEquality = (
  expressions: string[],
  schemaIndices: number[],
) => {
  const equalityDictionary: Dictionary<Dictionary<number>> = getEmptyObject();
  let isSimpleEquality = true;
  for (let i = 0, l = expressions.length; i < l; i++) {
    if (expressions[i] === 'true') {
      isSimpleEquality = false;
      break;
    }
    const matches = expressions[i].match(SIMPLE_EQUALITY_REGEX);
    if (matches) {
      const depIndex = matches[1];
      const value = matches[3];
      if (equalityDictionary[depIndex] === undefined)
        equalityDictionary[depIndex] = getEmptyObject();
      if (value in equalityDictionary[depIndex]) continue;
      equalityDictionary[depIndex][value] = schemaIndices[i];
    } else {
      isSimpleEquality = false;
      break;
    }
  }

  if (!isSimpleEquality || countKey(equalityDictionary) > 1) return null;

  const dependencyIndex = Number(getFirstKey(equalityDictionary));
  const valueMap = equalityDictionary[dependencyIndex];
  return (dependencies: unknown[]) => {
    const value = dependencies[dependencyIndex];
    return typeof value === 'string' && value in valueMap
      ? valueMap[value]
      : -1;
  };
};
