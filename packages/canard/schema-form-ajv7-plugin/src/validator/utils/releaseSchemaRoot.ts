import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Remove one registration and its compiled functions from owned Ajv instances. */
export const releaseSchemaRoot = (
  root: object,
  roots: WeakMap<object, SchemaRootRegistration>,
  active: SchemaRootRegistration[],
): void => {
  const registration = roots.get(root);
  if (!registration) return;
  registration.validation.removeSchema(registration.key);
  registration.validation.removeSchema(root);
  registration.guard.removeSchema(registration.key);
  registration.guard.removeSchema(root);
  roots.delete(root);
  const index = active.indexOf(registration);
  if (index >= 0) active.splice(index, 1);
};
