import type { AjvInstance as Ajv } from '../../types/AjvInstance';

/**
 * Read a registered definition without compiling its asynchronous keywords in a synchronous context.
 * @param instance - Application instance holding schema environments and aliases.
 * @param key - Registered address requested by an isolated compiler.
 * @returns The schema value, or undefined for an unknown address.
 */
export const readRegisteredSchema = (
  instance: Ajv,
  key: string,
): object | boolean | undefined => {
  const entry = instance.schemas[key] ?? instance.refs[key];
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
