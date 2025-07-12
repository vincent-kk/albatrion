import type { Dictionary } from '@aileron/declare';

import type { JsonSchema } from '@/schema-form/types';

import type { VirtualReferencesMap } from '../getVirtualReferencesMap';
import { flattenConditions } from './utils/flattenConditions';

export type FieldConditionMap = Map<
  string,
  | Array<{
      condition: Dictionary<string | string[]>;
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
  virtualReferencesMap: VirtualReferencesMap | undefined,
): FieldConditionMap | undefined => {
  const conditions = flattenConditions(jsonSchema, virtualReferencesMap);
  if (!conditions) return undefined;
  const fieldConditionMap: FieldConditionMap = new Map();
  for (let i = 0; i < conditions.length; i++) {
    const { condition, required, inverse } = conditions[i];
    // Step 1. Process required fields
    for (let j = 0; j < required.length; j++) {
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
