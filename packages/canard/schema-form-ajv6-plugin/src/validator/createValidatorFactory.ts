import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type Ajv from 'ajv';

import { collectSchemaResources, type SchemaResource } from './utils/schemaPath/collectSchemaResources';
import { transformDataPath } from './utils/transformDataPath';

/**
 * Create promise-returning validation from an Ajv 6 instance and optional root key.
 */
export const createValidatorFactory =
  (ajv: Ajv.Ajv, key?: string) =>
  (jsonSchema: JSONSchema): ValidateFunction => {
    const transient = key !== undefined ? undefined : { ...JSON.parse(JSON.stringify(jsonSchema)), $async: true };
    const validate = key !== undefined ? ajv.getSchema(key) : transient && ajv.compile(transient);
    if (transient) ajv.removeSchema(transient);
    if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
    const schema = typeof validate.schema === 'object' ? validate.schema : undefined;
    const { schemaId, errorDataPath } = ajv._opts;
    let resources: SchemaResource[] | undefined;
    const getResources = schema && (() => resources ??= collectSchemaResources(schema, schemaId));
    return async (data) => {
      try {
        const result = validate(data);
        if (typeof result === 'boolean')
          return result ? null : transformDataPath(validate.errors ?? [], schema, errorDataPath, getResources);
        await result;
        return null;
      } catch (thrown) {
        if (thrown instanceof Error && 'ajv' in thrown && thrown.ajv === true &&
            'validation' in thrown && thrown.validation === true && 'errors' in thrown && Array.isArray(thrown.errors))
          return transformDataPath(thrown.errors, schema, errorDataPath, getResources);
        throw thrown;
      }
    };
  };
