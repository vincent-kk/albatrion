import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type Ajv from 'ajv';

import { registerSchemaRoot, type SchemaRootRegistry } from './utils/registerSchemaRoot';
import { createSchemaRootRegistry } from './utils/createSchemaRootRegistry';
import { transformErrors } from './utils/transformErrors';

/**
 * Creates an asynchronous validator for an isolated schema root.
 * @param ajv - The active AJV instance whose options and extensions define validation.
 * @param registry - Registrations shared with guard compilation and release.
 * @returns A compiler that preserves the authored schema and normalizes failures.
 */
export const createValidatorFactory = (ajv: Ajv, registry?: SchemaRootRegistry) => {
  const roots = registry ?? createSchemaRootRegistry();
  return (jsonSchema: JSONSchema): ValidateFunction => {
    const registration = registerSchemaRoot(roots, ajv, jsonSchema);
    const transient = registration.validationCopy
      ? { $async: true, $ref: registration.key }
      : { ...structuredClone(jsonSchema), $async: true };
    const validate = registration.validationAjv.compile(transient);
    registration.validationAjv.removeSchema(transient);
    return async (data) => {
      try {
        await validate(data);
        return null;
      } catch (thrown: unknown) {
        if (thrown instanceof Error && 'errors' in thrown && Array.isArray(thrown.errors))
          return transformErrors(thrown.errors, jsonSchema);
        throw thrown;
      }
    };
  };
};
