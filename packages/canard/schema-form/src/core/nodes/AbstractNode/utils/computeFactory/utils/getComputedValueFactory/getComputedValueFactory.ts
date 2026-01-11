import type { Fn } from '@aileron/declare';

import { JsonSchemaError } from '@/schema-form/errors';
import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import type { PathManager } from '../getPathManager';
import { JSON_POINTER_PATH_REGEX } from '../regex';
import { ALIAS, type ComputedValueFieldName } from '../type';

type GetComputedValue = Fn<[dependencies: unknown[]], unknown>;

/**
 * Creates a function to get computed values in a JSON schema.
 * @param jsonSchema - Node's JSON schema
 * @returns Computed value getter factory function
 */
export const getComputedValueFactory =
  (jsonSchema: JsonSchemaWithVirtual) =>
  /**
   * Returns a computed value factory function for the given dependency paths and field name.
   * @param dependencyPaths - Dependency path array
   * @param fieldName - Field name to get
   * @returns Computed value getter factory function or undefined
   */
  (
    pathManager: PathManager,
    fieldName: ComputedValueFieldName,
  ): GetComputedValue | undefined => {
    const expression: string | undefined =
      jsonSchema.computed?.[fieldName] ?? jsonSchema[ALIAS + fieldName];
    return createDynamicFunction(pathManager, fieldName, expression);
  };

/**
 * Creates a dynamic computed value getter function using dependency paths and expression.
 * @param dependencyPaths - Dependency path array
 * @param expression - Expression to evaluate
 * @returns Function that takes dependency array and returns computed value, or undefined
 */
const createDynamicFunction = (
  pathManager: PathManager,
  fieldName: ComputedValueFieldName,
  expression: string | undefined,
): GetComputedValue | undefined => {
  // Cannot process non-string expressions
  if (typeof expression !== 'string') return;

  // Transform JSON paths to dependency array references
  const computedExpression = expression
    .replace(JSON_POINTER_PATH_REGEX, (path) => {
      pathManager.set(path);
      return `(dependencies[${pathManager.findIndex(path)}])`;
    })
    .trim()
    .replace(/;$/, '');

  // Cannot create function if expression is empty after transformation
  if (computedExpression.length === 0) return;

  try {
    return new Function(
      'dependencies',
      `return (${computedExpression})`,
    ) as GetComputedValue;
  } catch (error) {
    throw new JsonSchemaError(
      'GET_COMPUTED_VALUE',
      `Failed to create dynamic function: ${fieldName} -> '${expression}'`,
      { fieldName, expression, computedExpression, error },
    );
  }
};
