import { isString } from '@winglet/common-utils/filter';
import { serializeNative } from '@winglet/common-utils/object';

import type { Dictionary } from '@aileron/declare';

import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

import type { FieldConditionMap } from '../../getFieldConditionMap';

/**
 * Creates executable code lists by field based on FieldConditionMap.
 * @param fieldConditionMap - Field condition map
 * @returns Map containing fields and executable code lists, or undefined if no conditions exist
 */
export const getConditionsMap = (
  fieldConditionMap: FieldConditionMap | undefined,
): Map<string, string[]> | undefined => {
  if (!fieldConditionMap) return undefined;
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

/**
 * Generates executable code strings from conditions.
 * @param condition - Condition dictionary
 * @param inverse - Whether it's an inverse condition
 * @param operations - Array to store results
 */
const getOperations = (
  condition: Dictionary<string | string[]>,
  inverse: boolean | undefined,
  operations: string[],
) => {
  for (const [key, value] of Object.entries(condition)) {
    if (isString(value))
      operations.push(
        `${JSONPointer.Parent}${JSONPointer.Separator}${key}${inverse ? '!==' : '==='}${serializeNative(value)}`,
      );
    else
      operations.push(
        `${inverse ? '!' : ''}${serializeNative(value)}.includes(${JSONPointer.Parent}${JSONPointer.Separator}${key})`,
      );
  }
};
