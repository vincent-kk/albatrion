import { isArray } from '@winglet/common-utils/filter';
import { serializeNative } from '@winglet/common-utils/object';

import type { Dictionary } from '@aileron/declare';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';
import type { AllowedValue } from '@/schema-form/types';

export type ConditionDictionary = Dictionary<AllowedValue | AllowedValue[]>;

/**
 * Converts a condition dictionary into an executable JavaScript expression string.
 *
 * Each condition is transformed into a JSONPointer-based comparison expression:
 * - Array values are converted to `includes` checks
 * - Other values are converted to equality comparisons
 * - Multiple conditions are combined with logical operators (&& or ||)
 *
 * @param condition - Dictionary of key-value pairs representing conditions
 * @param inverse - If true, converts to inverse (negated) conditions (default: false)
 * @param source - Base path for JSONPointer references (default: $.Parent)
 * @returns Combined condition expression string, or null if no conditions exist
 */
export const convertExpression = (
  condition: ConditionDictionary,
  inverse: boolean = false,
  source: string = $.Parent,
) => {
  const operations: string[] = [];
  for (const key in condition) {
    const value = condition[key];
    if (isArray(value)) {
      operations.push(
        `${inverse ? '!' : ''}${serializeNative(value)}.includes((${source}${$.Separator}${key}))`,
      );
    } else {
      if (typeof value === 'boolean')
        operations.push(
          `(${source}${$.Separator}${key})${inverse ? '!==' : '==='}${value}`,
        );
      else
        operations.push(
          `(${source}${$.Separator}${key})${inverse ? '!==' : '==='}${serializeNative(value)}`,
        );
    }
  }
  if (operations.length === 0) return null;
  if (operations.length === 1) return operations[0];

  const operator = inverse ? '||' : '&&';
  return operations.map((operation) => '(' + operation + ')').join(operator);
};
