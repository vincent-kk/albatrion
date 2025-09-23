import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Fn } from '@aileron/declare';

import { JsonSchemaError } from '@/schema-form/errors';
import { combineConditions } from '@/schema-form/helpers/dynamicExpression';
import type {
  JsonSchemaWithVirtual,
  PartialJsonSchema,
} from '@/schema-form/types';

import type { PathManager } from '../getPathManager';
import { JSON_POINTER_PATH_REGEX } from '../regex';
import { ALIAS, type ConditionIndexName } from '../type';
import { getExpressionFromSchema } from './utils/getExpressionFromSchema';

type GetConditionIndex = Fn<[dependencies: unknown[]], number>;

/**
 * Regular expression pattern for simple equality comparison
 * @example Matches expressions in the form dependencies[n] === "value"
 */
const SIMPLE_EQUALITY_REGEX =
  /^\s*dependencies\[(\d+)\]\s*===\s*(['"])([^'"]+)\2\s*$/;

/**
 * Creates a function to calculate the index of condition schema.
 * @param jsonSchema - JSON schema
 * @returns Condition index factory function
 */
export const getConditionIndexFactory =
  (jsonSchema: JsonSchemaWithVirtual) =>
  /**
   * Returns a condition index calculation function for the given dependency paths and field name.
   * @param dependencyPaths - Dependency path array
   * @param fieldName - Field name to calculate index for (oneOf, anyOf, etc.)
   * @param conditionField - Field name where condition is specified (if, ifNot, ifAny, ifAll)
   * @returns Condition index calculation function or undefined
   */
  (
    pathManager: PathManager,
    fieldName: string,
    conditionField: ConditionIndexName,
  ): GetConditionIndex | undefined => {
    // Conditional Index is only available for object schemas(oneOf, anyOf, etc.)
    if (jsonSchema.type !== 'object') return undefined;

    const conditionSchemas: PartialJsonSchema[] = jsonSchema[fieldName];
    if (!isArray(conditionSchemas)) return undefined;

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

    if (expressions.length === 0) return undefined;

    // Analysis for simple equality comparison optimization
    const equalityMap: Record<number, Record<string, number>> = {};
    let isSimpleEquality = true;

    for (let i = 0, l = expressions.length; i < l; i++) {
      if (expressions[i] === 'true') {
        isSimpleEquality = false;
        break;
      }

      // Match simple equality pattern
      const matches = expressions[i].match(SIMPLE_EQUALITY_REGEX);
      if (matches) {
        const depIndex = Number(matches[1]);
        const value = matches[3];
        if (!equalityMap[depIndex]) equalityMap[depIndex] = {};
        if (!hasOwnProperty(equalityMap[depIndex], value))
          equalityMap[depIndex][value] = schemaIndices[i];
      } else {
        // Exclude complex expressions from optimization
        isSimpleEquality = false;
        break;
      }
    }

    // Simple equality optimization: when all conditions are simple and use only one dependency
    const keys = Object.keys(equalityMap);
    if (isSimpleEquality && keys.length === 1) {
      const dependencyIndex = Number(keys[0]);
      const valueMap = equalityMap[dependencyIndex];
      return (dependencies: unknown[]) => {
        const value = dependencies[dependencyIndex];
        return typeof value === 'string' && hasOwnProperty(valueMap, value)
          ? valueMap[value]
          : -1;
      };
    }

    // General conditional expression handling: dynamic function generation through Function constructor
    const lines = new Array<string>(expressions.length);
    for (let i = 0, l = expressions.length; i < l; i++)
      lines[i] = `if(${expressions[i]}) return ${schemaIndices[i]};`;

    try {
      return new Function(
        'dependencies',
        `${lines.join('\n')}\nreturn -1;`,
      ) as GetConditionIndex;
    } catch (error) {
      throw new JsonSchemaError(
        'CONDITION_INDEX',
        `Failed to create dynamic function: ${fieldName} -> '${expressions.join(', ')}'`,
        { fieldName, expressions, lines, error },
      );
    }
  };
