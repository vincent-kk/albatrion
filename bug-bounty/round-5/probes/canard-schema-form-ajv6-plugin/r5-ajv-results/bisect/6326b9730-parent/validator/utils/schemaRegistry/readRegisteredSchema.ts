import type Ajv from 'ajv';

/**
 * Read the registered snapshot without compiling it in the application's error-path profile.
 * @param instance - Instance owning the registered schema address.
 * @param key - Registration key or schema resource address.
 * @returns The registered schema, or undefined for an unknown address.
 */
export const readRegisteredSchema = (
  instance: Ajv.Ajv,
  key: string,
): object | boolean | undefined => {
  const entry = instance._schemas[key] ?? instance._refs[key];
  if (
    entry &&
    typeof entry === 'object' &&
    'schema' in entry &&
    (typeof entry.schema === 'boolean' ||
      (entry.schema !== null && typeof entry.schema === 'object'))
  )
    return entry.schema;
  return instance.getSchema(key)?.schema;
};
