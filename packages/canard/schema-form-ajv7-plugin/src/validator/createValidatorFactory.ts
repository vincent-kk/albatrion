import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type { AjvInstance as Ajv } from './types/AjvInstance';
import { assertBindableInstance } from './utils/assertBindableInstance';
import { cloneInstance } from './utils/cloneInstance';
import { registerSchemaRoot, type SchemaRootRegistry } from './utils/registerSchemaRoot';

import { transformErrors } from './utils/transformErrors';

/** Create promise-returning validation from a root registered with Ajv 7. */
export const createValidatorFactory =
  (ajv: Ajv, key?: string, roots?: SchemaRootRegistry) => {
    if (!roots) assertBindableInstance(ajv);
    const registry = roots ?? new WeakMap();
    return (jsonSchema: JSONSchema): ValidateFunction => {
      if (key !== undefined) assertBindableInstance(ajv);
      const validate =
        key === undefined
          ? registerSchemaRoot(registry, ajv, jsonSchema)
          : cloneInstance(ajv, 'validation').getSchema(key);
      if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
      const schema = typeof validate.schema === 'object' ? validate.schema : undefined;
      const notRequiredKeys = new Map<string, string | null>();
      return async (data) => {
        try {
          const result = validate(data);
          if (typeof result === 'boolean')
            return result ? null : transformErrors(validate.errors ?? [], schema, notRequiredKeys);
          await result;
          return null;
        } catch (thrown) {
          if (thrown instanceof Error && 'ajv' in thrown && thrown.ajv === true &&
              'validation' in thrown && thrown.validation === true && 'errors' in thrown && Array.isArray(thrown.errors))
            return transformErrors(thrown.errors, schema, notRequiredKeys);
          throw thrown;
        }
      };
    };
  };
