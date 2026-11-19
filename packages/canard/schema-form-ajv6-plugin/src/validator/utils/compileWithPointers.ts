import type { JSONSchema } from '@canard/schema-form';
import type Ajv from 'ajv';

import { pointerCompilerOf } from './compileWithPointers/pointerCompilerOf';
import { compileWithSchemaFallback } from './compileWithSchemaFallback';
import { pointerCompilations } from './pointerCompilerCache';
import { releaseSeededPointerCompilation } from './releaseSeededPointerCompilation';
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
    try {
      return ajv.compile(transient);
    } finally {
      ajv.removeSchema(transient);
    }
  }
  const seeded = key ? pointerCompilations.get(schema) : undefined;
  if (key && !forceAsync && seeded?.seeded?.key === key)
    return compileWithSchemaFallback(compiler, ajv, () =>
      compiler.getSchema(key),
    );
  const registered = key ? readRegisteredSchema(ajv, key) : schema;
  if (registered === undefined) return undefined;
  if (forceAsync) {
    const previous = pointerCompilations.get(schema);
    if (
      previous &&
      !releaseSeededPointerCompilation(schema) &&
      typeof previous.schema === 'object'
    )
      compiler.removeSchema(previous.schema);
  }
  const snapshot =
    forceAsync && typeof registered === 'object'
      ? { ...registered, $async: true }
      : registered;
  if (!key && ajv._opts.validateSchema !== false)
    ajv.validateSchema(schema, true);
  if (key) pointerCompilations.set(schema, { compiler, schema: snapshot });
  try {
    return compileWithSchemaFallback(compiler, ajv, () =>
      ajv.compile.call(compiler, snapshot),
    );
  } finally {
    if (!key && typeof snapshot === 'object') compiler.removeSchema(snapshot);
  }
};
