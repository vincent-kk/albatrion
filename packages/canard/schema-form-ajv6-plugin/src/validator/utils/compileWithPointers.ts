import type { JSONSchema } from '@canard/schema-form';
import type Ajv from 'ajv';

import { pointerCompilerOf } from './compileWithPointers/pointerCompilerOf';
import { compileWithSchemaFallback } from './compileWithSchemaFallback';
import { pointerCompilations } from './pointerCompilerCache';
import { readRegisteredSchema } from './schemaRegistry/readRegisteredSchema';

/**
 * Compile in an independent path profile without changing application options or cached functions.
 * @param ajv - Application instance or an entirely plugin-owned normalized instance.
 * @param schema - Authored snapshot compiled directly when no registered key is supplied.
 * @param key - Optional registered root address.
 * @param forceAsync - Retry an asynchronous keyword with an asynchronous root context.
 * @returns The compiled validator, or undefined for an unknown registered address.
 */
export const compileWithPointers = (
  ajv: Ajv.Ajv,
  schema: JSONSchema,
  key?: string,
  forceAsync = false,
): Ajv.ValidateFunction | undefined => {
  const compiler = pointerCompilerOf(ajv);
  if (compiler === ajv) {
    if (key && !forceAsync) return ajv.getSchema(key);
    const transient = key ? { $async: true, $ref: key } : schema;
    const validate = ajv.compile(transient);
    ajv.removeSchema(transient);
    return validate;
  }
  const registered = key ? readRegisteredSchema(ajv, key) : schema;
  if (registered === undefined) return undefined;
  if (forceAsync) {
    const previous = pointerCompilations.get(schema);
    if (previous && typeof previous.schema === 'object')
      compiler.removeSchema(previous.schema);
  }
  const snapshot =
    forceAsync && typeof registered === 'object'
      ? { ...registered, $async: true }
      : registered;
  const validateSchema = compiler._opts.validateSchema;
  if (key) compiler._opts.validateSchema = false;
  if (key) pointerCompilations.set(schema, { compiler, schema: snapshot });
  try {
    return compileWithSchemaFallback(compiler, ajv, () =>
      ajv.compile.call(compiler, snapshot),
    );
  } finally {
    if (key) compiler._opts.validateSchema = validateSchema;
    if (!key && typeof snapshot === 'object') compiler.removeSchema(snapshot);
  }
};
