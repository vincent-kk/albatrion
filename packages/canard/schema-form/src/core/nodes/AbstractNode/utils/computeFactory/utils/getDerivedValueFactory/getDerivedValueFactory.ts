import type { Fn } from '@aileron/declare';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { createDynamicFunction } from '../createDynamicFunction';
import type { PathManager } from '../getPathManager';
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
