import type { JSONSchema } from '@canard/schema-form';

import type { SchemaRootRegistry } from './registerSchemaRoot';
import { disposeSchemaRoot } from './disposeSchemaRoot';
import { instanceIdRegistrationsOf } from './instanceIdRegistrationsOf';

/** Remove one copy's registrations across every binding of this entry point. */
export const releaseSchemaRoot = (registry: SchemaRootRegistry, root: JSONSchema): void => {
  const registrations = registry.entries.get(root);
  if (!registrations) return;
  for (const registration of registrations) {
    registry.finalizer.unregister(registration);
    disposeSchemaRoot(registration);
    if (registration.ids.length) {
      const shared = instanceIdRegistrationsOf(registration.baseAjv);
      for (let index = shared.length - 1; index >= 0; index--) {
        const entry = shared[index].deref();
        if (!entry || entry === registration) shared.splice(index, 1);
      }
    }
  }
  registry.entries.delete(root);
  for (let index = registry.active.length - 1; index >= 0; index--) {
    const entry = registry.active[index].deref();
    if (!entry || registrations.includes(entry)) registry.active.splice(index, 1);
  }
};
