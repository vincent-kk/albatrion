import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type { AjvInstance as Ajv } from './types/AjvInstance';

import { transformErrors } from './utils/transformErrors';

/** Create promise-returning validation from a root registered with Ajv 7. */
export const createValidatorFactory =
  (ajv: Ajv, key?: string) =>
  (jsonSchema: JSONSchema): ValidateFunction => {
    const transient: JSONSchema | undefined = key !== undefined
      ? undefined : JSON.parse(JSON.stringify(jsonSchema));
    const validate = key !== undefined ? ajv.getSchema(key) : transient && ajv.compile(transient);
    if (transient) ajv.removeSchema(transient);
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
