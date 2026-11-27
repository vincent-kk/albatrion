import type { Dictionary } from '@aileron/declare';

import { isArray } from '@/common-utils';

/**
 * Extracts fields selected by a schema and optional conditions.
 *
 * @param value Source object to filter.
 * @param schema Object schema selecting the retained fields.
 * @param oneOfIndex Selected oneOf branch; absent or below -1 removes all branch fields.
 * @param conditions Optional field filters; absent leaves fields unfiltered.
 * @returns Object filtered by the schema and conditions.
 */
export const processValueWithSchema = (
  value: Dictionary | undefined,
  fieldConditionMap: FieldConditionMap | undefined,
  oneOfKeySet?: Set<string>,
  allowedKeySet?: Set<string>,
): Dictionary | undefined => {
  if (value == null || (!fieldConditionMap && !oneOfKeySet)) return value;

  const inputKeys = Object.keys(value);
  if (!inputKeys.length) return value;

  const isRequired = requiredFactory(value, fieldConditionMap);
  const filteredValue: Dictionary = {};
  for (let i = 0; i < inputKeys.length; i++) {
    const key = inputKeys[i];
    if (isRequired && !isRequired(key)) continue;
    if (oneOfKeySet && oneOfKeySet.has(key) && !allowedKeySet?.has(key))
      continue;
    filteredValue[key] = value[key];
  }
  return filteredValue;
};

type FieldConditionMap = Map<
  string,
  | Array<{
      condition: Dictionary<string | string[]>;
      inverse?: boolean;
    }>
  | true
>;

/**
 * Builds a predicate for fields required by the current schema conditions.
 * @param value Current object used to evaluate conditions.
 * @param fieldConditionMap Conditions indexed by field name.
 * @returns Predicate indicating whether a field key is required.
 */
const requiredFactory = (
  value: Dictionary,
  fieldConditionMap: FieldConditionMap | undefined,
): ((key: string) => boolean) | null => {
  if (!fieldConditionMap) return null;

  return (key: string): boolean => {
    const conditions = fieldConditionMap.get(key);
    if (!conditions) return false;
    if (conditions === true) return true;
    for (let i = 0; i < conditions.length; i++) {
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
