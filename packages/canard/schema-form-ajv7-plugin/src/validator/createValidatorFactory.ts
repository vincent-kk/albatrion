import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type { AjvInstance as Ajv } from './types/AjvInstance';
import { registerSchemaRoot, type SchemaRootRegistry } from './utils/registerSchemaRoot';

import { transformErrors } from './utils/transformErrors';

/** Create promise-returning validation from a root registered with Ajv 7. */
export const createValidatorFactory =
  (ajv: Ajv, key?: string, roots: SchemaRootRegistry = new WeakMap()) =>
  (jsonSchema: JSONSchema): ValidateFunction => {
    const validate = key === undefined ? registerSchemaRoot(roots, ajv, jsonSchema) : ajv.getSchema(key);
    if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
    const schema = typeof validate.schema === 'object' ? validate.schema : undefined;
    return async (data) => {
      try {
        const result = validate(data);
        if (typeof result === 'boolean')
          return result ? null : transformErrors(validate.errors ?? [], schema);
        await result;
        return null;
      } catch (thrown) {
        if (thrown instanceof Error && 'ajv' in thrown && thrown.ajv === true &&
            'validation' in thrown && thrown.validation === true && 'errors' in thrown && Array.isArray(thrown.errors))
          return transformErrors(thrown.errors, schema);
        throw thrown;
      }
    };
  };
