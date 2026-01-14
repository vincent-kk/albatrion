import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { createDynamicFunction } from '../createDynamicFunction';
import type { PathManager } from '../getPathManager';
import { ALIAS, type ConditionFieldName } from '../type';

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
   * @returns Computed option check function or undefined
   */
  (pathManager: PathManager, fieldName: ConditionFieldName) => {
    const expression: string | boolean | undefined =
      rootJsonSchema[fieldName] ??
      jsonSchema[fieldName] ??
      jsonSchema.computed?.[fieldName] ??
      jsonSchema[ALIAS + fieldName];
    if (typeof expression === 'boolean') return () => expression;
    return createDynamicFunction(pathManager, fieldName, expression, true);
  };
