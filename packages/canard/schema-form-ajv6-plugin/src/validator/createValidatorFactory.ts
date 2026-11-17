import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import Ajv from 'ajv';

import { collectSchemaResources } from './utils/schemaPath/collectSchemaResources';
import { createChildSchemaPathTest } from './utils/schemaPath/createChildSchemaPathTest';
import { isChildSchemaPath } from './utils/schemaPath/isChildSchemaPath';import { createNotRequiredKeyLookup } from './utils/schemaPath/createNotRequiredKeyLookup';
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
    const transient = key ? undefined : { ...JSON.parse(JSON.stringify(jsonSchema)), $async: true };
    const validate = key ? ajv.getSchema(key) : transient && ajv.compile(transient);
    if (transient) ajv.removeSchema(transient);
    if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
    const compiled: object = transient ?? jsonSchema;
    const resources = collectSchemaResources(compiled, ajv._opts.schemaId === 'id' || ajv._opts.schemaId === 'auto');
    // Without resources every path is `#/` or unmatched, so the uncached classifier does no extra work.
    const isChildPath = resources.length ? createChildSchemaPathTest(resources) : isChildSchemaPath;
    const notRequiredKeyOf = createNotRequiredKeyLookup(compiled, resources);
    return async (data) => {
      try {
        const valid = await validate(data);
        return valid ? null : transformDataPath(validate.errors ?? [], isChildPath, notRequiredKeyOf);
      } catch (thrown) {
        if (thrown instanceof Ajv.ValidationError)
          return transformDataPath(thrown.errors, isChildPath, notRequiredKeyOf);
        throw thrown;
      }
    };
  };
