import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type { Ajv } from 'ajv';

import { assertBindableInstance } from './utils/assertBindableInstance';
import {
  type SchemaRootRegistry,
  registerSchemaRoot,
} from './utils/registerSchemaRoot';
import { transformErrors } from './utils/transformErrors';

/**
 * Builds a compiler tied to one AJV instance and the roots it shares with its owner.
 * @param ajv - Instance whose non-mutating options and extensions define validation.
 * @param roots - Detached registrations held by the factory or validator object.
 * @returns A compiler that normalizes validation failures and preserves execution exceptions.
 * @throws ValidatorBindRefusedError if the instance can modify the input.
 */
export const createValidationCompiler = (
  ajv: Ajv,
  roots: SchemaRootRegistry,
) => {
  assertBindableInstance(ajv);
  const ValidationError: unknown = Reflect.get(
    ajv.constructor,
    'ValidationError',
  );
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
        if (
          typeof ValidationError === 'function' &&
          thrown instanceof ValidationError &&
          'errors' in thrown &&
          Array.isArray(thrown.errors)
        )
          return transformErrors(thrown.errors, validate.schema);
        throw thrown;
      }
    };
  };
};
