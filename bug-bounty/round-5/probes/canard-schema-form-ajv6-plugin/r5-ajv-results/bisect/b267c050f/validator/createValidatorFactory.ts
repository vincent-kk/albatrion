import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type Ajv from 'ajv';

import { compileWithPointers } from './utils/compileWithPointers';
import { collectSchemaResources } from './utils/schemaPath/collectSchemaResources';
import { createChildSchemaPathTest } from './utils/schemaPath/createChildSchemaPathTest';
import { createNotRequiredKeyLookup } from './utils/schemaPath/createNotRequiredKeyLookup';
import { isChildSchemaPath } from './utils/schemaPath/isChildSchemaPath';
import { transformDataPath } from './utils/transformDataPath';

/**
 * Create promise-returning validation from an Ajv 6 instance and optional root key.
 * @param ajv - Instance that compiles, or holds, the schema.
 * @param key - Key of a schema already registered on `ajv`; without one, `jsonSchema` is cloned
 *   and compiled here.
 * @returns A factory whose `jsonSchema` is the object AJV compiles from: with a key, the
 *   registered copy itself. Issue conversion reads that copy or the local clone, never an object
 *   the caller can still mutate.
 */
export const createValidatorFactory =
  (ajv: Ajv.Ajv, key?: string) =>
  (jsonSchema: JSONSchema): ValidateFunction => {
    const transient = key
      ? undefined
      : { ...JSON.parse(JSON.stringify(jsonSchema)), $async: true };
    let validate: Ajv.ValidateFunction | undefined;
    let isAsyncReference = false;
    try {
      validate = compileWithPointers(ajv, transient ?? jsonSchema, key);
    } catch (error) {
      if (!key || !(error instanceof Error) || error.message !== 'async keyword in sync schema') throw error;
      validate = compileWithPointers(ajv, jsonSchema, key, true);
      isAsyncReference = true;
    }
    const rootPrefix = isAsyncReference ? `${key}/` : '';
    if (!validate)
      throw new Error(`Registered Ajv schema was not found: ${key}`);
    const compiled: object = transient ?? jsonSchema;
    const resources = collectSchemaResources(
      compiled,
      ajv._opts.schemaId === 'id' || ajv._opts.schemaId === 'auto',
    );
    // Without resources every path is `#/` or unmatched, so the uncached classifier does no extra work.
    const isChildPath = resources.length
      ? createChildSchemaPathTest(resources)
      : isChildSchemaPath;
    const notRequiredKeyOf = createNotRequiredKeyLookup(compiled, resources);
    return async (data) => {
      try {
        const result = validate(data);
        if (typeof result === 'boolean')
          return result
            ? null
            : transformDataPath(
                validate.errors ?? [],
                isChildPath,
                notRequiredKeyOf,
              );
        await result;
        return null;
      } catch (thrown) {
        if (
          thrown !== null &&
          typeof thrown === 'object' &&
          'ajv' in thrown &&
          thrown.ajv === true &&
          'validation' in thrown &&
          thrown.validation === true &&
          'errors' in thrown &&
          Array.isArray(thrown.errors)
        ) {
          const errors = isAsyncReference
            ? thrown.errors.map((error: Ajv.ErrorObject) => ({
                ...error,
                schemaPath: error.schemaPath.startsWith(rootPrefix)
                  ? `#/${error.schemaPath.slice(rootPrefix.length)}`
                  : error.schemaPath,
              }))
            : thrown.errors;
          const issues = transformDataPath(errors, isChildPath, notRequiredKeyOf);
          if (isAsyncReference)
            for (let index = 0; index < issues.length; index++)
              issues[index].source = thrown.errors[index];
          return issues;
        }
        throw thrown;
      }
    };
  };
