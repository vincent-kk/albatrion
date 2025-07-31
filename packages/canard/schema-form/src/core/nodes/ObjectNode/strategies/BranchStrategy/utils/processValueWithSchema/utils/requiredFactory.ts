import { isArray } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import type { FieldConditionMap } from '../../getFieldConditionMap';

/**
 * Analyzes schema conditions and returns a function that determines which properties are required for a specific value.
 * @param value Current object value
 * @param fieldConditionMap Field condition map
 * @returns Function that takes a key and returns whether that key is required
 */
export const requiredFactory = (
  value: Dictionary,
  fieldConditionMap: FieldConditionMap,
): ((key: string) => boolean) => {
  return (key: string): boolean => {
    const conditions = fieldConditionMap.get(key);
    if (!conditions) return false;
    if (conditions === true) return true;
    for (let i = 0, l = conditions.length; i < l; i++) {
      const { condition, inverse } = conditions[i];
      let matches = true;
      const condKeys = Object.keys(condition);
      if (condKeys.length === 1) {
        const condKey = condKeys[0];
        const condValue = condition[condKey];
        const currentValue = value[condKey];
        if (isArray(condValue)) matches = condValue.includes(currentValue);
        else matches = condValue === currentValue;
      } else {
        // Normal path for multiple conditions
        for (const [condKey, condValue] of Object.entries(condition)) {
          const currentValue = value[condKey];
          if (isArray(condValue)) matches = condValue.includes(currentValue);
          else matches = condValue === currentValue;
          if (!matches) break;
        }
      }
      if (inverse) matches = !matches;
      if (matches) return true;
    }
    return false;
  };
};
