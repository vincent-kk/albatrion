import { isString } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

import { SchemaNodeError } from '@/schema-form/errors';
import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import type { PathManager } from './getPathManager';
import { JSON_POINTER_PATH_REGEX } from './regex';
import { ALIAS, type ConditionFieldName } from './type';

type CheckComputedOption = Fn<[dependencies: unknown[]], boolean>;

/**
 * Creates a function to check computed options in a JSON schema.
 * @param jsonSchema - Node's JSON schema
 * @param rootJsonSchema - Root node's JSON schema
 * @returns Computed option factory function
 */
export const checkComputedOptionFactory =
  (jsonSchema: JsonSchemaWithVirtual, rootJsonSchema: JsonSchemaWithVirtual) =>
  /**
   * Returns a condition check function for the given dependency paths and field name.
   * @param dependencyPaths - Dependency path array
   * @param fieldName - Field name to check
   * @param checkCondition - Condition value to check
   * @returns Computed option check function or undefined
   */
  (
    pathManager: PathManager,
    fieldName: ConditionFieldName,
    checkCondition: boolean,
  ): CheckComputedOption | undefined => {
    // Extract expression from `computed.[<fieldName>]` or `&[<fieldName>]` field
    const expression =
      jsonSchema?.computed?.[fieldName] ?? jsonSchema?.[ALIAS + fieldName];

    // Check if preferred condition already matches boolean value
    const preferredCondition =
      rootJsonSchema[fieldName] === checkCondition ||
      jsonSchema[fieldName] === checkCondition ||
      expression === checkCondition;

    // Return fixed function if preferred condition matches, otherwise create dynamic function
    return preferredCondition
      ? () => checkCondition
      : createDynamicFunction(pathManager, fieldName, expression);
  };

/**
 * Creates a dynamic condition check function using dependency paths and expression.
 * @param dependencyPaths - Dependency path array
 * @param expression - Expression to evaluate
 * @returns Function that takes dependency array and returns condition result, or undefined
 */
const createDynamicFunction = (
  pathManager: PathManager,
  fieldName: ConditionFieldName,
  expression: string | boolean | undefined,
): CheckComputedOption | undefined => {
  // Cannot process non-string expressions
  if (!isString(expression)) return;

  // Transform JSON paths to dependency array references
  const computedExpression = expression
    .replace(JSON_POINTER_PATH_REGEX, (path) => {
      pathManager.set(path);
      return `dependencies[${pathManager.findIndex(path)}]`;
    })
    .trim()
    .replace(/;$/, '');

  // Cannot create function if expression is empty after transformation
  if (computedExpression.length === 0) return;

  try {
    // Create dynamic condition check function
    return new Function(
      'dependencies',
      `return !!(${computedExpression})`,
    ) as CheckComputedOption;
  } catch (error) {
    throw new SchemaNodeError(
      'COMPUTED_OPTION',
      `Failed to create dynamic function: ${fieldName} -> '${expression}'`,
      { fieldName, expression, computedExpression, error },
    );
  }
};
