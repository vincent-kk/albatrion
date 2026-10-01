import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import Ajv from 'ajv';

import { transformDataPath } from './utils/transformDataPath';

/**
 * Create promise-returning validation from an Ajv 6 instance and optional root key.
 */
export const createValidatorFactory =
  (ajv: Ajv.Ajv, key?: string) =>
  (jsonSchema: JSONSchema): ValidateFunction => {
    const validate = key
      ? ajv.getSchema(key)
      : ajv.compile({ ...jsonSchema, $async: true });
    if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
    return async (data) => {
      try {
        const valid = await validate(data);
        return valid ? null : transformDataPath(validate.errors ?? [], jsonSchema);
      } catch (thrown) {
        if (thrown instanceof Ajv.ValidationError)
          return transformDataPath(thrown.errors, jsonSchema);
        throw thrown;
      }
    };
  };
