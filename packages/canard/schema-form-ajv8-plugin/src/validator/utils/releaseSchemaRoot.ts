import type { JSONSchema } from '@canard/schema-form';

import type { SchemaRootRegistry } from './registerSchemaRoot';

/**
 * Removes both AJV registrations for a root and discards its compiled functions.
 * @param registry - The plugin's owned registrations.
 * @param root - The root whose cache entry was evicted.
 * @returns Nothing; later compilation registers the root anew.
 */
export const releaseSchemaRoot = (registry: SchemaRootRegistry, root: JSONSchema): void => {
  const registrations = registry.entries.get(root);
  if (!registrations) return;
  for (const registration of registrations) {
    for (const resource of [registration, ...registration.probes]) {
      resource.validationAjv.removeSchema(resource.key);
      resource.validationAjv.removeSchema(resource.validationCopy);
      for (const ref of resource.validationRefs) resource.validationAjv.removeSchema(ref);
      resource.guardAjv.removeSchema(resource.key);
      resource.guardAjv.removeSchema(resource.guardCopy);
      for (const ref of resource.guardRefs) resource.guardAjv.removeSchema(ref);
    }
  }
  registry.entries.delete(root);
};
