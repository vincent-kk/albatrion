import { isString, serializeNative } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import type { FlattenCondition } from '../flattenConditions';

export const getConditionsMap = (flattedConditions: FlattenCondition[]) => {
  const oneOfConditionsMap: Map<string, string[]> = new Map();
  for (const flattedCondition of flattedConditions) {
    const { condition, required, inverse } = flattedCondition;
    const operations = getOperations(condition, inverse);
    for (const field of required) {
      oneOfConditionsMap.set(field, [
        ...(oneOfConditionsMap.get(field) || []),
        ...operations,
      ]);
    }
  }
  return oneOfConditionsMap;
};

const getOperations = (
  condition: Dictionary<string | string[]>,
  inverse: boolean | undefined,
) => {
  const operations: string[] = [];
  for (const [key, value] of Object.entries(condition)) {
    if (isString(value))
      operations.push(
        `@.${key}${inverse ? '!==' : '==='}${serializeNative(value)}`,
      );
    else
      operations.push(
        `${inverse ? '!' : ''}${serializeNative(value)}.includes(@.${key})`,
      );
  }
  return operations;
};
