import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

import type { AjvInstance as Ajv } from './types/AjvInstance';
import { transformErrors } from './utils/transformErrors';

/** Create promise-returning validation from a root registered with Ajv 7. */
export const createValidatorFactory =
  (ajv: Ajv, key?: string) =>
  (jsonSchema: JSONSchema): ValidateFunction => {
    let transient: JSONSchema | undefined = key
      ? undefined
      : JSON.parse(JSON.stringify(jsonSchema));
    let validate: ReturnType<Ajv['compile']> | undefined;
    let isAsyncReference = false;
    try {
      validate = key ? ajv.getSchema(key) : transient && ajv.compile(transient);
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.message !== 'async keyword in sync schema'
      )
        throw error;
      if (transient) ajv.removeSchema(transient);
      transient = key
        ? { $async: true, $ref: key }
        : { ...transient, $async: true };
      validate = ajv.compile(transient);
      isAsyncReference = key !== undefined;
    }
    const rootPrefix = isAsyncReference ? `${key}/` : '';
    if (transient) ajv.removeSchema(transient);
    if (!validate)
      throw new Error(`Registered Ajv schema was not found: ${key}`);
    const ValidationError = Reflect.get(ajv.constructor, 'ValidationError');
    const notRequiredKeys = new Map<string, string | null>();
    return async (data) => {
      try {
        const result = validate(data);
        if (typeof result === 'boolean')
          return result
            ? null
            : transformErrors(
                validate.errors ?? [],
                jsonSchema,
                notRequiredKeys,
              );
        await result;
        return null;
      } catch (thrown) {
        if (
          thrown !== null &&
          typeof thrown === 'object' &&
          typeof ValidationError === 'function' &&
          thrown instanceof ValidationError &&
          'errors' in thrown &&
          Array.isArray(thrown.errors)
        ) {
          const errors = isAsyncReference
            ? thrown.errors.map((error: ErrorObject) => ({
                ...error,
                schemaPath: error.schemaPath.startsWith(rootPrefix)
                  ? `#/${error.schemaPath.slice(rootPrefix.length)}`
                  : error.schemaPath,
              }))
            : thrown.errors;
          const issues = transformErrors(errors, jsonSchema, notRequiredKeys);
          if (isAsyncReference)
            for (let index = 0; index < issues.length; index++)
              issues[index].source = thrown.errors[index];
          return issues;
        }
        throw thrown;
      }
    };
  };
