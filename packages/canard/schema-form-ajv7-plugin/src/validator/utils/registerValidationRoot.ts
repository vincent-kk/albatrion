import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Put the snapshot's entries back in their order, keeping the object's identity. */
const restoreInPlace = <T>(target: Record<string, T>, snapshot: [string, T][]): void => {
  for (const key of Object.keys(target)) delete target[key];
  for (const [key, value] of snapshot) target[key] = value;
};

/**
 * Register a root's validation copy on its validation instance, once, when the whole-schema
 * compile first needs it; AJV's root meta-schema check therefore runs only for full validation.
 * The registration is atomic: when AJV rejects the copy (a meta-schema violation or an `$id` the
 * plugin could not isolate), `refs` and `schemas` return to their earlier values and key order,
 * so consumer schemas, string aliases and the order clones copy survive, the copy's cache
 * entry is removed, and a later call validates the copy again.
 * @param registration - Root registration; a root without `$id` has no `validationCopy` and is skipped
 * @returns Nothing; on success sets `validationRegistered`
 * @throws The error of AJV's `addSchema`, after the rollback
 */
export const registerValidationRoot = (registration: SchemaRootRegistration): void => {
  const { validation: ajv, validationCopy: copy } = registration;
  if (!copy || registration.validationRegistered) return;
  const refs = Object.entries(ajv.refs);
  const schemas = Object.entries(ajv.schemas);
  try {
    ajv.addSchema(copy, registration.key);
  } catch (error) {
    // removeSchema(copy) also deletes the entries under the copy's `$id`; the restore brings back a consumer's.
    ajv.removeSchema(copy);
    restoreInPlace(ajv.refs, refs);
    restoreInPlace(ajv.schemas, schemas);
    throw error;
  }
  registration.validationRegistered = true;
};
