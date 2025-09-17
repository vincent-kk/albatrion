import { map } from '@winglet/common-utils/array';
import { isTruthy } from '@winglet/common-utils/filter';

/**
 * Function to combine multiple conditions with a specified operator.
 * @param conditions - Conditions to combine
 * @param operator - Operator to use ('&&' or '||')
 * @returns Combined condition expression
 */
export const combineConditions = <Condition>(
  conditions: (Condition | undefined)[],
  operator: string,
) => {
  const filtered = conditions.filter(isTruthy);
  if (filtered.length === 1) return filtered[0];
  return map(filtered, (item) => '(' + item + ')').join(operator);
};
