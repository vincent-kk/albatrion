import type { JSONSchema } from '@canard/schema-form';
import type Ajv from 'ajv';

/**
 * Compile exact AJV6 JSON Pointer locations, whose dynamic keys need no guessing.
 * @param ajv - Instance that owns the schema cache and extensions.
 * @param schema - Schema to compile when no registered key is supplied.
 * @param key - Optional plugin-owned registration key.
 * @returns The compiled validator, or undefined for an unknown registration.
 */
export const compileWithPointers = (
  ajv: Ajv.Ajv,
  schema: JSONSchema,
  key?: string,
): Ajv.ValidateFunction | undefined => {
  const options = ajv._opts;
  const jsonPointers = options.jsonPointers;
  options.jsonPointers = true;
  try {
    return key ? ajv.getSchema(key) : ajv.compile(schema);
  } finally {
    if (jsonPointers === undefined) delete options.jsonPointers;
    else options.jsonPointers = jsonPointers;
  }
};
