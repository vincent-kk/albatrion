import type { AjvInstance as Ajv } from '../types/AjvInstance';

/**
 * Replays the application's keys and references using detached native registrations.
 * @param source - The application AJV whose address table defines the bindings.
 * @param target - A fresh private AJV with schema validation disabled during replay.
 */
export const registerApplicationSchemas = (
  source: Ajv,
  target: Ajv,
): void => {
  const registrations = new Map<object, ReturnType<Ajv['_addSchema']>>();
  for (const table of [source.schemas, source.refs]) {
    for (const entry of Object.values(table)) {
      if (!entry || typeof entry === 'string' || entry.root !== entry || registrations.has(entry))
        continue;
      const copy = JSON.parse(JSON.stringify(entry.schema));
      registrations.set(entry, target._addSchema(copy, entry.meta, false, false));
      // AJV registers embedded IDs while building local references.
      for (const address of Object.keys(target.refs)) delete target.refs[address];
    }
  }
  for (const [key, entry] of Object.entries(source.schemas)) {
    const registration = entry && registrations.get(entry);
    if (registration) target.schemas[key] = registration;
  }
  for (const [key, entry] of Object.entries(source.refs)) {
    const registration = typeof entry === 'string' ? entry : entry && registrations.get(entry);
    if (registration !== undefined) target.refs[key] = registration;
  }
};
