import { isString, serializeNative } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import { FieldConditionMap } from '../getFieldConditionMap';

export const getConditionsMap = (
  fieldConditionMap: FieldConditionMap | undefined,
): Map<string, string[]> | undefined => {
  if (!fieldConditionMap) return undefined;
  const oneOfConditionsMap: Map<string, string[]> = new Map();
  for (const [field, conditions] of fieldConditionMap.entries()) {
    const operations: string[] = [];
    for (let i = 0; i < conditions.length; i++)
      getOperations(conditions[i].condition, conditions[i].inverse, operations);

    oneOfConditionsMap.set(field, operations);
  }
  return oneOfConditionsMap;
};

const getOperations = (
  condition: Dictionary<string | string[]>,
  inverse: boolean | undefined,
  operations: string[],
) => {
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
};
