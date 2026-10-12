import type Ajv from 'ajv';

import { cloneInstance } from './cloneInstance';
import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Materialize a first-error sibling only when a guard is requested. */
export const registerSchemaGuard = (
  root: object,
  instance: Ajv,
  registration: SchemaRootRegistration,
): Ajv => {
  if (registration.guard) return registration.guard;
  const guard = cloneInstance(instance, false);
  const guardCopy: object = JSON.parse(JSON.stringify(root));
  guard.addSchema(guardCopy, registration.key);
  registration.guard = guard;
  registration.guardCopy = guardCopy;
  return guard;
};
