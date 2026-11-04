import { map } from '@winglet/common-utils/array';
import { isTruthy } from '@winglet/common-utils/filter';

import type { Nullish } from '@aileron/declare';

/**
 * Function to combine multiple conditions with a specified operator.
 * @param conditions - Conditions to combine
 * @param operator - Operator to use ('&&' or '||').
 *                   Default is '&&' (all conditions must be true)
 * @returns Combined condition expression
 */
export const combineConditions = (
  conditions: (string | Nullish)[],
  operator: '&&' | '||' = '&&',
) => {
  const filtered = conditions.filter(isTruthy);
  if (filtered.length === 0) return null;
  if (filtered.length === 1) return filtered[0];
  return map(filtered, (item) => '(' + item + ')').join(operator);
};
