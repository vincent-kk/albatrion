import { combineConditions } from '@/schema-form/helpers/dynamicExpression';
import type { PartialJsonSchema } from '@/schema-form/types';

import type { PathManager } from '../../../getPathManager';
import { JSON_POINTER_PATH_REGEX } from '../../../regex';
import { ALIAS, type ConditionIndexName } from '../../../type';
import { getExpressionFromSchema } from './utils/getExpressionFromSchema';

export const extractConditionInfo = (
  conditionSchemas: PartialJsonSchema[],
  conditionField: ConditionIndexName,
  pathManager: PathManager,
) => {
  const expressions: string[] = [];
  const schemaIndices: number[] = [];

  // Collect only valid expressions and maintain original schema indices
  for (let i = 0, l = conditionSchemas.length; i < l; i++) {
    const oneOfSchema = conditionSchemas[i];
    if (!oneOfSchema) continue;

    // Extract condition from `computed.[<conditionField>]` or `&[<conditionField>]` field
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
