import type { JSONSchema } from '@canard/schema-form';

import { disposeSchemaRoot } from './disposeSchemaRoot';
import { instanceIdRegistrationsOf } from './instanceIdRegistrationsOf';
import type { SchemaRootRegistry } from './registerSchemaRoot';
import { removeRootRegistration } from './removeRootRegistration';

/** Synchronously release this adapter's roots without changing any application registry. */
export const releaseSchemaRoot = (
  registry: SchemaRootRegistry,
  root: JSONSchema,
): void => {
  const registrations = registry.entries.get(root);
  if (!registrations) return;
  for (const registration of registrations) {
    const ledger = instanceIdRegistrationsOf(registration.baseAjv);
    ledger.finalizer?.unregister(registration);
    disposeSchemaRoot(registration);
    const index = registration.slot;
    if (index !== undefined && ledger.active[index]?.deref() === registration)
      removeRootRegistration(ledger, index, registration);
  }
  registry.entries.delete(root);
};
