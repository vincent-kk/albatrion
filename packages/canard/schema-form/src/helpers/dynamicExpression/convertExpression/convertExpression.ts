import { isArray } from '@winglet/common-utils/filter';
import { serializeNative } from '@winglet/common-utils/object';

import type { Dictionary } from '@aileron/declare';

import { JSONPointer } from '@/schema-form/helpers/jsonPointer';
import type { AllowedValue } from '@/schema-form/types';

export type ConditionDictionary = Dictionary<AllowedValue | AllowedValue[]>;

/**
 * Generates executable code strings from conditions.
 * @param condition - Condition dictionary
 * @param inverse - Whether it's an inverse condition
 * @param operations - Array to store results
 */
export const convertExpression = (
  condition: ConditionDictionary,
  inverse: boolean = false,
  source: string = JSONPointer.Parent,
) => {
  const operations: string[] = [];
  for (const [key, value] of Object.entries(condition)) {
    if (isArray(value)) {
      operations.push(
        `${inverse ? '!' : ''}${serializeNative(value)}.includes((${source}${SEPARATOR}${key}))`,
      );
    } else {
      if (typeof value === 'boolean')
        operations.push(
          `(${source}${SEPARATOR}${key})${inverse ? '!==' : '==='}${value}`,
        );
      else
        operations.push(
          `(${source}${SEPARATOR}${key})${inverse ? '!==' : '==='}${serializeNative(value)}`,
        );
    }
  }
  if (operations.length === 0) return null;
  if (operations.length === 1) return operations[0];
  return operations.map((operation) => '(' + operation + ')').join('&&');
};

const SEPARATOR = JSONPointer.Separator;
