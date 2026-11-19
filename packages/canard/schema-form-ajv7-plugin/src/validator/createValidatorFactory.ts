import type { JSONSchema, ValidateFunction } from '@canard/schema-form';

import type { AjvInstance as Ajv } from './types/AjvInstance';
import { assertBindableInstance } from './utils/assertBindableInstance';
import { createSchemaRootRegistry } from './utils/createSchemaRootRegistry';
import { selectRootCompiler } from './utils/privateCompiler/selectRootCompiler';
import { validatePrivateSchema } from './utils/privateCompiler/validatePrivateSchema';
import {
  type SchemaRootRegistry,
  registerSchemaRoot,
} from './utils/registerSchemaRoot';
import { transformErrors } from './utils/transformErrors';

/**
 * Creates an asynchronous validator for an isolated schema root.
 * @param ajv - The active AJV instance whose options and extensions define validation.
 * @param key - Optional application schema address resolved through current raw registrations.
 * @param registry - Registrations shared with guard compilation and release.
 * @returns A compiler that preserves the authored schema and normalizes failures.
 */
export const createValidatorFactory = (
  ajv: Ajv,
  key?: string,
  registry?: SchemaRootRegistry,
) => {
  if (!registry) assertBindableInstance(ajv);
  const roots = registry ?? createSchemaRootRegistry();
  return (jsonSchema: JSONSchema): ValidateFunction => {
    const registration = registerSchemaRoot(roots, ajv, jsonSchema);
    if (registration.validate) return registration.validate;
    const copy = key ? { $ref: key } : registration.copy;
    const compiler = selectRootCompiler(registration, copy, 'validation');
    let validate: ReturnType<Ajv['compile']>;
    try {
      registration.validationMeta = validatePrivateSchema(ajv, copy);
      if (compiler.asynchronous) copy.$async = true;
      validate = compiler.instance.compile(copy);
    } catch (error) {
      compiler.retired = true;
      throw error;
    }
    const compiledRoot = registration.copy;
    const ValidationError = Reflect.get(ajv.constructor, 'ValidationError');
    // AJV reports the same schema paths on every run of this validator, so each not.required lookup walks the root once.
    const notRequiredKeys = new Map<string, string | null>();
    const normalized: ValidateFunction = async (data) => {
      try {
        const result = validate(data);
        if (typeof result === 'boolean')
          return result
            ? null
            : transformErrors(
                validate.errors ?? [],
                compiledRoot,
                notRequiredKeys,
              );
        await result;
        return null;
      } catch (thrown: unknown) {
        if (
          thrown !== null &&
          typeof thrown === 'object' &&
          typeof ValidationError === 'function' &&
          thrown instanceof ValidationError &&
          'errors' in thrown &&
          Array.isArray(thrown.errors)
        )
          return transformErrors(thrown.errors, compiledRoot, notRequiredKeys);
        throw thrown;
      }
    };
    registration.validate = normalized;
    return normalized;
  };
};
