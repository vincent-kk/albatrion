import { convertExpression } from '@/schema-form/helpers/dynamicExpression';

import type { FieldConditionMap } from '../getFieldConditionMap';

export type ConditionsMap = Map<string, string[]>;

/**
 * Creates executable code lists by field based on FieldConditionMap.
 * @param fieldConditionMap - Field condition map
 * @returns Map containing fields and executable code lists, or undefined if no conditions exist
 */
export const getConditionsMap = (
  fieldConditionMap: FieldConditionMap | undefined,
): ConditionsMap | undefined => {
  if (!fieldConditionMap) return undefined;
  const oneOfConditionsMap: ConditionsMap = new Map();
  for (const [field, conditions] of fieldConditionMap.entries()) {
    if (conditions === true) continue;
    const operations: string[] = [];
    for (let i = 0, l = conditions.length; i < l; i++) {
      const source = conditions[i];
      const operation = convertExpression(source.condition, source.inverse);
      if (operation) operations.push(operation);
    }
    oneOfConditionsMap.set(field, operations);
  }
  return oneOfConditionsMap;
};
