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
    if (conditions === undefined || conditions === true) return true;
    for (let i = 0, l = conditions.length; i < l; i++) {
      const condition = conditions[i].condition;
      let matches = true;
      const keys = Object.keys(condition);
      if (keys.length === 1) {
        const condValue = condition[keys[0]];
        const currentValue = value[keys[0]];
        if (isArray(condValue)) matches = condValue.includes(currentValue);
        else matches = condValue === currentValue;
      } else {
        // Normal path for multiple conditions
        for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
          const condValue = condition[k];
          const currentValue = value[k];
          if (isArray(condValue)) matches = condValue.includes(currentValue);
          else matches = condValue === currentValue;
          if (!matches) break;
        }
      }
      if (conditions[i].inverse) matches = !matches;
      if (matches) return true;
    }
    return false;
  };
};
