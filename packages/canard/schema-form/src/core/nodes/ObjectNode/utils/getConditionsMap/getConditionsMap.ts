import { JSONPath, isString, serializeNative } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import { FieldConditionMap } from '../getFieldConditionMap';

export const getConditionsMap = (
  fieldConditionMap: FieldConditionMap,
): Map<string, string[]> => {
  const oneOfConditionsMap: Map<string, string[]> = new Map();
  for (const [field, conditions] of fieldConditionMap.entries()) {
    if (conditions === true) continue;
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
        `${JSONPath.Parent}${JSONPath.Child}${key}${inverse ? '!==' : '==='}${serializeNative(value)}`,
      );
    else
      operations.push(
        `${inverse ? '!' : ''}${serializeNative(value)}.includes(${JSONPath.Parent}${JSONPath.Child}${key})`,
      );
  }
};
