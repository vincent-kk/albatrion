import type { JSONSchema } from '@canard/schema-form';

import { disposeSchemaRoot } from './disposeSchemaRoot';
import { instanceIdRegistrationsOf } from './instanceIdRegistrationsOf';
import type { SchemaRootRegistry } from './registerSchemaRoot';

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
    for (let index = ledger.active.length - 1; index >= 0; index--) {
      const entry = ledger.active[index].deref();
      if (!entry || entry === registration) ledger.active.splice(index, 1);
    }
  }
  registry.entries.delete(root);
};
