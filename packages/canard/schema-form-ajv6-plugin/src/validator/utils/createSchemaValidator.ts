import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import type Ajv from 'ajv';

import { compileWithPointers } from './compileWithPointers';
import { collectSchemaResources } from './schemaPath/collectSchemaResources';
import { createChildSchemaPathTest } from './schemaPath/createChildSchemaPathTest';
import { createNotRequiredKeyLookup } from './schemaPath/createNotRequiredKeyLookup';
import { isChildSchemaPath } from './schemaPath/isChildSchemaPath';
import { transformDataPath } from './transformDataPath';

/**
 * Compile one independent promise-returning validator with an authored native execution mode.
 * @param ajv - Application or isolated normalized compiler.
 * @param jsonSchema - Snapshot used for compilation and issue classification.
 * @param key - Optional registered root address.
 * @param forceAsync - Force native async compilation for the public low-level factory contract.
 * @param serialized - Snapshot from this same registration call; absent for previously registered roots.
 * @returns A promise-returning validator capturing each invocation's own errors.
 */
export const createSchemaValidator = (
  ajv: Ajv.Ajv,
  jsonSchema: JSONSchema,
  key?: string,
  forceAsync = false,
  serialized?: string,
): ValidateFunction => {
  let transient: JSONSchema | undefined = key
    ? undefined
    : {
        ...JSON.parse(serialized ?? JSON.stringify(jsonSchema)),
        ...(forceAsync ? { $async: true } : {}),
      };
  let validate: Ajv.ValidateFunction | undefined;
  let isAsyncReference = false;
  try {
    validate = compileWithPointers(ajv, transient ?? jsonSchema, key);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      error.message !== 'async keyword in sync schema'
    )
      throw error;
    if (key) {
      validate = compileWithPointers(ajv, jsonSchema, key, true);
      isAsyncReference = true;
    } else {
      transient = { ...transient, $async: true };
      validate = compileWithPointers(ajv, transient);
    }
  }
  const rootPrefix = isAsyncReference ? `${key}/` : '';
  if (!validate) throw new Error(`Registered Ajv schema was not found: ${key}`);
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
