import type { JSONSchema } from '@canard/schema-form';

import type { SchemaRootRegistry } from './registerSchemaRoot';
import { disposeSchemaRoot } from './disposeSchemaRoot';

/** Remove one copy's registrations across every binding of this entry point. */
export const releaseSchemaRoot = (registry: SchemaRootRegistry, root: JSONSchema): void => {
  const registrations = registry.entries.get(root);
  if (!registrations) return;
  for (const registration of registrations) {
    registry.finalizer.unregister(registration);
    disposeSchemaRoot(registration);
  }
  registry.entries.delete(root);
  for (let index = registry.active.length - 1; index >= 0; index--) {
    const entry = registry.active[index].deref();
    if (!entry || registrations.includes(entry)) registry.active.splice(index, 1);
  }
};
