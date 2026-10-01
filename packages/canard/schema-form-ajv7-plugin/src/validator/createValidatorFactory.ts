import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type Ajv from 'ajv';

import { transformErrors } from './utils/transformErrors';

/** Create promise-returning validation from a root registered with Ajv 7. */
export const createValidatorFactory =
  (ajv: Ajv, key?: string) =>
  (jsonSchema: JSONSchema): ValidateFunction => {
    const transient: JSONSchema | undefined = key
      ? undefined : JSON.parse(JSON.stringify(jsonSchema));
    const validate = key ? ajv.getSchema(key) : transient && ajv.compile(transient);
    if (transient) ajv.removeSchema(transient);
    if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
    return async (data) => {
      try {
        const valid = await validate(data);
        return valid ? null : transformErrors(validate.errors ?? [], jsonSchema);
      } catch (thrown) {
        if (thrown instanceof Error && 'errors' in thrown && Array.isArray(thrown.errors))
          return transformErrors(thrown.errors, jsonSchema);
        throw thrown;
      }
    };
  };
