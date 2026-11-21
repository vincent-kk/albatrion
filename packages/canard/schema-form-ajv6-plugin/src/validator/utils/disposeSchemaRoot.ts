import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Release only private cache entries; returned functions keep their immutable snapshots. */
export const disposeSchemaRoot = (
  registration: SchemaRootRegistration,
): void => {
  if (registration.released) return;
  registration.released = true;
  registration.validation?.instance.removeSchema(registration.copy);
  for (const { compiler, schema } of registration.guardSchemas) {
    if (typeof schema === 'object') compiler.instance.removeSchema(schema);
    compiler.instance.removeSchema(registration.key);
  }
  registration.guardSchemas.length = 0;
  registration.validate = undefined;
  registration.guards.clear();
};
