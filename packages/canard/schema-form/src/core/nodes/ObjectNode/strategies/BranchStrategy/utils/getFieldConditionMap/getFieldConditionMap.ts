import type { JsonSchema } from '@/schema-form/types';

import {
  type FlattenCondition,
  flattenConditions,
} from './utils/flattenConditions';

export type FieldConditionMap = Map<
  string,
  | Array<{
      condition: FlattenCondition['condition'];
      inverse?: boolean;
    }>
  | true
>;
/**
 * Refines jsonSchema by field and returns an array of conditions (and inverse status) for each field to become required.
 * @param jsonSchema jsonSchema
 * @returns Map<fieldName, Array<{ condition, inverse }>> | true
 */
export const getFieldConditionMap = (
  jsonSchema: JsonSchema,
): FieldConditionMap | undefined => {
  const conditions = flattenConditions(jsonSchema);
  if (!conditions) return undefined;
  const fieldConditionMap: FieldConditionMap = new Map();
  for (let i = 0, il = conditions.length; i < il; i++) {
    const { condition, required, inverse } = conditions[i];
    // Step 1. Process required fields
    for (let j = 0, jl = required.length; j < jl; j++) {
      const field = required[j];
      const previous = fieldConditionMap.get(field);
      if (previous === true) continue; // If already true, skip
      if (!previous) fieldConditionMap.set(field, [{ condition, inverse }]);
      else previous.push({ condition, inverse });
    }
    // Step 2. Process fields that only appear in condition
    for (const key of Object.keys(condition))
      if (!required.includes(key)) fieldConditionMap.set(key, true);
  }
  return fieldConditionMap;
};
