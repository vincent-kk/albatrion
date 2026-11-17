import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import Ajv from 'ajv';

import { collectSchemaResources } from './utils/schemaPath/collectSchemaResources';
import { createNotRequiredKeyLookup } from './utils/schemaPath/createNotRequiredKeyLookup';
import { transformDataPath } from './utils/transformDataPath';

/**
 * Create promise-returning validation from an Ajv 6 instance and optional root key.
 * @param ajv - Instance that compiles, or holds, the schema.
 * @param key - Key of a schema already registered on `ajv`; without one, `jsonSchema` is cloned
 *   and compiled here.
 * @returns A factory that compiles `jsonSchema` and converts its issues.
 */
export const createValidatorFactory =
  (ajv: Ajv.Ajv, key?: string) =>
  (jsonSchema: JSONSchema): ValidateFunction => {
    const transient = key ? undefined : { ...JSON.parse(JSON.stringify(jsonSchema)), $async: true };
    const validate = key ? ajv.getSchema(key) : transient && ajv.compile(transient);
    if (transient) ajv.removeSchema(transient);
    if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
    const resources = collectSchemaResources(jsonSchema);
    const notRequiredKeyOf = createNotRequiredKeyLookup(jsonSchema, resources);
    return async (data) => {
      try {
        const valid = await validate(data);
        return valid ? null : transformDataPath(validate.errors ?? [], resources, notRequiredKeyOf);
      } catch (thrown) {
        if (thrown instanceof Ajv.ValidationError)
          return transformDataPath(thrown.errors, resources, notRequiredKeyOf);
        throw thrown;
      }
    };
  };
