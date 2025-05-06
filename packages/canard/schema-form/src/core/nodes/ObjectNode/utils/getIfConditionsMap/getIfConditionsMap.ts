import { isString, serializeNative } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import type { ObjectSchema } from '@/schema-form/types';

import { flattenConditions } from './utils/flattenConditions';

export const getIfConditionsMap = (jsonSchema: ObjectSchema) => {
  if (!jsonSchema.if || !jsonSchema.then) return null;

  const flattedConditionSchemas = flattenConditions(jsonSchema);

  const oneOfConditionsMap: Map<string, string[]> = new Map();
  for (const conditionSchema of flattedConditionSchemas) {
    const { condition, required, inverse } = conditionSchema;
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
      operations.push(`@.${key}${inverse ? '!==' : '==='}"${value}"`);
    else
      operations.push(
        `${inverse ? '!' : ''}${serializeNative(value)}.includes(@.${key})`,
      );
  }
  return operations;
};
