import { disposeSchemaRoot } from './disposeSchemaRoot';
import { instanceIdRegistrationsOf } from './instanceIdRegistrationsOf';
import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Remove one registration and its compiled functions from owned Ajv instances. */
export const releaseSchemaRoot = (
  root: object,
  roots: WeakMap<object, SchemaRootRegistration>,
  active: Pick<WeakRef<SchemaRootRegistration>, 'deref'>[],
  finalizer: FinalizationRegistry<SchemaRootRegistration> | undefined,
): void => {
  const registration = roots.get(root);
  if (!registration) return;
  finalizer?.unregister(registration);
  disposeSchemaRoot(registration);
  roots.delete(root);
  if (registration.ids.length) {
    const shared = instanceIdRegistrationsOf(registration.base).active;
    for (let index = shared.length - 1; index >= 0; index--) {
      const entry = shared[index].deref();
      if (!entry || entry === registration) shared.splice(index, 1);
    }
  }
  for (let index = active.length - 1; index >= 0; index--) {
    const entry = active[index].deref();
    if (!entry || entry === registration) active.splice(index, 1);
  }
};
