import { isArray } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

import { JSON_POINTER_REGEX } from '@/schema-form/helpers/jsonPointer';
import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import type { PathManager } from './getPathManager';
import { ALIAS, type ConditionFieldName } from './type';

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
    conditionField: ConditionFieldName,
  ): GetConditionIndex | undefined => {
    // Return undefined if schema is invalid
    if (jsonSchema.type !== 'object' || !isArray(jsonSchema[fieldName]))
      return undefined;

    const conditionSchemas = jsonSchema[fieldName];
    const expressions: string[] = [];
    const schemaIndices: number[] = [];

    // Collect only valid expressions and maintain original schema indices
    for (let index = 0; index < conditionSchemas.length; index++) {
      // Extract expression from `computed.[<conditionField>]` or `&[<conditionField>]` field
      const condition =
        conditionSchemas[index]?.computed?.[conditionField] ??
        conditionSchemas[index]?.[ALIAS + conditionField];

      // Handle boolean conditions
      if (typeof condition === 'boolean') {
        if (condition === true) {
          expressions.push('true');
          schemaIndices.push(index);
        }
        continue;
      }

      // Handle string conditions
      const expression = condition?.trim?.();
      if (!expression || typeof expression !== 'string') continue;

      // Transform JSON paths to dependency array references
      expressions.push(
        expression
          .replace(JSON_POINTER_REGEX, (path) => {
            pathManager.set(path);
            return `dependencies[${pathManager.findIndex(path)}]`;
          })
          .replace(/;$/, ''),
      );
      schemaIndices.push(index);
    }

    if (expressions.length === 0) return undefined;

    // Analysis for simple equality comparison optimization
    const equalityMap: Record<number, Record<string, number>> = {};
    let isSimpleEquality = true;

    for (let index = 0; index < expressions.length; index++) {
      if (expressions[index] === 'true') {
        isSimpleEquality = false;
        break;
      }

      // Match simple equality pattern
      const matches = expressions[index].match(SIMPLE_EQUALITY_REGEX);
      if (matches) {
        const depIndex = parseInt(matches[1], 10);
        const value = matches[3];
        if (!equalityMap[depIndex]) equalityMap[depIndex] = {};
        if (!(value in equalityMap[depIndex]))
          equalityMap[depIndex][value] = schemaIndices[index];
      } else {
        // Exclude complex expressions from optimization
        isSimpleEquality = false;
        break;
      }
    }

    // Simple equality optimization: when all conditions are simple and use only one dependency
    const keys = Object.keys(equalityMap);
    if (isSimpleEquality && keys.length === 1) {
      const dependencyIndex = parseInt(keys[0], 10);
      const valueMap = equalityMap[dependencyIndex];

      // Return optimized simple equality comparison function
      return (dependencies: unknown[]) => {
        const value = dependencies[dependencyIndex];
        return typeof value === 'string' && value in valueMap
          ? valueMap[value]
          : -1;
      };
    }

    // General conditional expression handling: dynamic function generation through Function constructor
    const lines = new Array<string>(expressions.length);
    for (let index = 0; index < expressions.length; index++)
      lines[index] =
        `if(${expressions[index]}) return ${schemaIndices[index]};`;

    return new Function(
      'dependencies',
      `${lines.join('\n')}
    return -1;
  `,
    ) as GetConditionIndex;
  };
