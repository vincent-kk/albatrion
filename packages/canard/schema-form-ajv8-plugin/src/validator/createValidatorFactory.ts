import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type { Ajv } from 'ajv';

import { registerSchemaRoot, type SchemaRootRegistry } from './utils/registerSchemaRoot';
import { createSchemaRootRegistry } from './utils/createSchemaRootRegistry';
import { registerValidationRoot } from './utils/registerValidationRoot';
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
    registerValidationRoot(registration);
    const { validationAjv, validationCopy, key } = registration;
    const transient = validationCopy ? undefined : { ...JSON.parse(JSON.stringify(jsonSchema)), $async: true };
    const validate = transient ? validationAjv.compile(transient) : validationAjv.getSchema(key);
    if (transient) validationAjv.removeSchema(transient);
    if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
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
