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
    const validate = compileWithPointers(ajv, transient ?? jsonSchema, key);
    if (transient) ajv.removeSchema(transient);
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
        )
          return transformDataPath(
            thrown.errors,
            isChildPath,
            notRequiredKeyOf,
          );
        throw thrown;
      }
    };
  };
