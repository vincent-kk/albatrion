import type Ajv from 'ajv';

import { cloneInstance } from './cloneInstance';
import type { SchemaRootRegistration } from './registerSchemaRoot';

/**
 * Register the root copy on the first-error guard instance for guards that need the root location.
 * The guard instance compiles without meta-schema validation; full validation still validates the root.
 * @param root - Authored root registered under the registration key
 * @param instance - Bound instance whose profile the guard instance copies
 * @param registration - Root registration that keeps the guard instance and its copy
 * @returns The guard instance that compiles this root's guards
 */
export const registerSchemaGuard = (
  root: object,
  instance: Ajv,
  registration: SchemaRootRegistration,
): Ajv => {
  if (registration.guard && registration.guardCopy) return registration.guard;
  const guard = registration.guard ?? cloneInstance(instance, false, false);
  const guardCopy: object = JSON.parse(JSON.stringify(root));
  guard.addSchema(guardCopy, registration.key);
  registration.guard = guard;
  registration.guardCopy = guardCopy;
  return guard;
};
