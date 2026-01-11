import type { Fn } from '@aileron/declare';

import { JsonSchemaError } from '@/schema-form/errors';
import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import type { PathManager } from '../getPathManager';
import { JSON_POINTER_PATH_REGEX } from '../regex';
import { ALIAS, type DerivedValueFieldName } from '../type';

type GetDerivedValue = Fn<[dependencies: unknown[]], any>;

/**
 * Creates a function to get derived values in a JSON schema.
 * @param jsonSchema - Node's JSON schema
 * @returns Derived value getter factory function
 */
export const getDerivedValueFactory =
  (jsonSchema: JsonSchemaWithVirtual) =>
  /**
   * Returns a derived value factory function for the given dependency paths and field name.
   * @param dependencyPaths - Dependency path array
   * @param fieldName - Field name to get
   * @returns Derived value getter factory function or undefined
   */
  (
    pathManager: PathManager,
    fieldName: DerivedValueFieldName,
  ): GetDerivedValue | undefined => {
    const expression: string | undefined =
      jsonSchema.computed?.[fieldName] ?? jsonSchema[ALIAS + fieldName];
    return createDynamicFunction(pathManager, fieldName, expression);
  };

/**
 * Creates a dynamic derived value getter function using dependency paths and expression.
 * @param dependencyPaths - Dependency path array
 * @param expression - Expression to evaluate
 * @returns Function that takes dependency array and returns derived value, or undefined
 */
const createDynamicFunction = (
  pathManager: PathManager,
  fieldName: DerivedValueFieldName,
  expression: string | undefined,
): GetDerivedValue | undefined => {
  // Cannot process non-string expressions
  if (typeof expression !== 'string') return;

  // Transform JSON paths to dependency array references
  const derivedExpression = expression
    .replace(JSON_POINTER_PATH_REGEX, (path) => {
      pathManager.set(path);
      return `dependencies[${pathManager.findIndex(path)}]`;
    })
    .trim()
    .replace(/;$/, '');

  // Cannot create function if expression is empty after transformation
  if (derivedExpression.length === 0) return;

  const functionBody =
    derivedExpression.startsWith('{') && derivedExpression.endsWith('}')
      ? derivedExpression.slice(1, -1).trim()
      : `return ${derivedExpression}`;

  try {
    return new Function('dependencies', functionBody) as GetDerivedValue;
  } catch (error) {
    throw new JsonSchemaError(
      'GET_DERIVED_VALUE',
      `Failed to create dynamic function: ${fieldName} -> '${expression}'`,
      { fieldName, expression, derivedExpression, error },
    );
  }
};
