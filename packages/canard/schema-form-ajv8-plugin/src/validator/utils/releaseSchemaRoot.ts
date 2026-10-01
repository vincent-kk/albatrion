import type { JSONSchema } from '@canard/schema-form';

import type { SchemaRootRegistration, SchemaRootRegistry } from './registerSchemaRoot';

/** Remove Ajv's strong references when a root is released or collected. */
export const disposeSchemaRoot = (registration: SchemaRootRegistration): void => {
  for (const resource of [registration, ...registration.probes]) {
    if (resource.validationCopy) {
      resource.validationAjv.removeSchema(resource.key);
      resource.validationAjv.removeSchema(resource.validationCopy);
      for (const ref of resource.validationRefs) resource.validationAjv.removeSchema(ref);
    }
    if (resource.guardAjv) {
      resource.guardAjv.removeSchema(resource.key);
      if (resource.guardCopy) resource.guardAjv.removeSchema(resource.guardCopy);
      for (const ref of resource.guardRefs ?? []) resource.guardAjv.removeSchema(ref);
    }
  }
};

/** Construct weak root ownership with cleanup for roots callers abandon. */
export const createSchemaRootRegistry = (): SchemaRootRegistry => ({
  entries: new WeakMap(),
  active: [],
  finalizer: new FinalizationRegistry(disposeSchemaRoot),
  compilerCount: 0,
  nextId: 0,
});

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
