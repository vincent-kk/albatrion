import { combineConditions } from '@/schema-form/helpers/dynamicExpression';
import type { PartialJsonSchema } from '@/schema-form/types';

import type { PathManager } from '../../../getPathManager';
import { JSON_POINTER_PATH_REGEX } from '../../../regex';
import { ALIAS, type ConditionIndexName } from '../../../type';
import { getExpressionFromSchema } from './utils/getExpressionFromSchema';

/**
 * Extracts and processes conditional information from an array of JSON schemas
 *
 * This function iterates through conditional schemas (typically from oneOf/anyOf),
 * extracts condition expressions from computed fields or schema properties,
 * and transforms JSONPointer paths to dependency array indices for runtime evaluation.
 *
 * @param conditionSchemas - Array of JSON schemas containing conditional logic
 * @param conditionField - The field name to check for conditions ('if', 'check', etc.)
 * @param pathManager - Manager for tracking and indexing JSONPointer paths
 * @returns Object containing processed expressions and corresponding schema indices
 *
 * @example
 * // Input: schemas with computed.if conditions
 * // Output: { expressions: ["dependencies[0] === 'email'"], schemaIndices: [0] }
 *
 * @example
 * // Input: schemas with boolean true conditions
 * // Output: { expressions: ["true"], schemaIndices: [2] }
 */
export const extractConditionInfo = (
  conditionSchemas: PartialJsonSchema[],
  conditionField: ConditionIndexName,
  pathManager: PathManager,
) => {
  const expressions: string[] = [];
  const schemaIndices: number[] = [];

  for (let i = 0, l = conditionSchemas.length; i < l; i++) {
    const oneOfSchema = conditionSchemas[i];
    if (!oneOfSchema) continue;

    const condition: boolean | string | undefined =
      oneOfSchema.computed?.[conditionField] ??
      oneOfSchema[ALIAS + conditionField];

    if (typeof condition === 'boolean') {
      if (condition === true) {
        expressions.push('true');
        schemaIndices.push(i);
      }
      continue;
    }

    const expression = combineConditions([
      typeof condition === 'string' ? condition.trim() : null,
      getExpressionFromSchema(oneOfSchema),
    ]);

    if (expression === null) continue;
    expressions.push(
      expression
        .replace(JSON_POINTER_PATH_REGEX, (path) => {
          pathManager.set(path);
          return `dependencies[${pathManager.findIndex(path)}]`;
        })
        .replace(/;$/, ''),
    );
    schemaIndices.push(i);
  }

  return { expressions, schemaIndices };
};
