import type { SchemaRootRegistration } from './registerSchemaRoot';
import { disposeSchemaRoot } from './disposeSchemaRoot';

/** Remove one registration and its compiled functions from owned Ajv instances. */
export const releaseSchemaRoot = (
  root: object,
  roots: WeakMap<object, SchemaRootRegistration>,
  active: WeakRef<SchemaRootRegistration>[],
  finalizer: FinalizationRegistry<SchemaRootRegistration>,
): void => {
  const registration = roots.get(root);
  if (!registration) return;
  finalizer.unregister(registration);
  disposeSchemaRoot(registration);
  roots.delete(root);
  for (let index = active.length - 1; index >= 0; index--) {
    const entry = active[index].deref();
    if (!entry || entry === registration) active.splice(index, 1);
  }
};
