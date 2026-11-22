import type AjvModule from 'ajv';

type Ajv = AjvModule.Ajv;

/**
 * Replays the application's keys and references using detached native registrations.
 * @param source - The application AJV whose address table defines the bindings.
 * @param target - A fresh private AJV with schema validation disabled during replay.
 */
export const registerApplicationSchemas = (source: Ajv, target: Ajv): void => {
  const registrations = new Map<object, Ajv['_schemas'][string]>();
  for (const table of [source._schemas, source._refs]) {
    for (const [key, entry] of Object.entries(table)) {
      if (typeof entry !== 'object' || entry === null || registrations.has(entry))
        continue;
      const copy = JSON.parse(JSON.stringify(entry.schema));
      if (entry.meta) target.addMetaSchema(copy, key);
      else target.addSchema(copy, key);
      registrations.set(entry, target._schemas[key]);
      delete target._schemas[key];
      // AJV registers embedded IDs while building local references.
      for (const address of Object.keys(target._refs)) delete target._refs[address];
    }
  }
  for (const [key, entry] of Object.entries(source._schemas))
    if (entry) target._schemas[key] = registrations.get(entry);
  for (const [key, entry] of Object.entries(source._refs))
    if (entry !== undefined)
      target._refs[key] = typeof entry === 'string' ? entry : registrations.get(entry);
};
