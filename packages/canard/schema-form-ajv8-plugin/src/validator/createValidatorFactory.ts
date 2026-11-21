import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type { Ajv } from 'ajv';

import { registerSchemaRoot, type SchemaRootRegistry } from './utils/registerSchemaRoot';
import { transformErrors } from './utils/transformErrors';

/**
 * Creates an asynchronous validator for an isolated schema root.
 * @param ajv - The active AJV instance whose options and extensions define validation.
 * @param registry - Registrations shared with guard compilation and release.
 * @returns A compiler that preserves the authored schema and normalizes failures.
 */
export const createValidatorFactory = (ajv: Ajv, registry?: SchemaRootRegistry) => {
  const roots = registry ?? new WeakMap();
  return (jsonSchema: JSONSchema): ValidateFunction => {
    const validate = registerSchemaRoot(roots, ajv, jsonSchema);
    return async (data) => {
      try {
        const result = validate(data);
        if (typeof result === 'boolean')
          return result ? null : transformErrors(validate.errors ?? [], validate.schema);
        await result;
        return null;
      } catch (thrown: unknown) {
        if (thrown instanceof Error && 'ajv' in thrown && thrown.ajv === true &&
            'validation' in thrown && thrown.validation === true && 'errors' in thrown && Array.isArray(thrown.errors))
          return transformErrors(thrown.errors, validate.schema);
        throw thrown;
      }
    };
  };
};
