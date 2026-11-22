import type { AjvInstance as Ajv } from '../types/AjvInstance';

/** Native registry entry for an application validation document. */
type RegisteredSchema = NonNullable<Ajv['schemas'][string]>;

/**
 * Captures the mutable documents replayed as application validation references.
 * @param instance - The application instance supplying its native registrations.
 * @returns The unique registered documents and their current JSON bodies.
 */
export const readApplicationSchemaBodies = (
  instance: Ajv,
): readonly (readonly [RegisteredSchema, string])[] | undefined => {
  const bodies = new Map<RegisteredSchema, string>();
  for (const entry of [...Object.values(instance.schemas), ...Object.values(instance.refs)]) {
    if (!entry || typeof entry === 'string' || entry.meta || entry.root !== entry || bodies.has(entry)) continue;
    bodies.set(entry, JSON.stringify(entry.schema));
  }
  return bodies.size ? [...bodies] : undefined;
};
