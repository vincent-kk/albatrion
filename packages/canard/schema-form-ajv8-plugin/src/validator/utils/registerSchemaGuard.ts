import type { JSONSchema } from '@canard/schema-form';
import type { Ajv } from 'ajv';

import { makeSibling } from './makeSibling';
import type { SchemaRootRegistration } from './registerSchemaRoot';

/**
 * Register the root copy on the first-error sibling for guards that reference their root.
 * Guards are compiled without meta-schema validation; full validation still validates the root.
 * @param baseAjv - Bound instance whose profile the sibling copies
 * @param root - Authored root registered under the registration key
 * @param registration - Root registration that keeps the sibling
 * @returns The sibling that compiles this root's guards
 */
export const registerSchemaGuard = (
  baseAjv: Ajv,
  root: JSONSchema,
  registration: SchemaRootRegistration,
): Ajv => {
  if (registration.guardAjv && registration.guardCopy) return registration.guardAjv;
  const guardCopy: JSONSchema = JSON.parse(JSON.stringify(root));
  const guardAjv = registration.guardAjv ?? makeSibling(baseAjv, false, false);
  const refsBefore = Object.keys(guardAjv.refs);
  guardAjv.addSchema(guardCopy, registration.key);
  registration.guardAjv = guardAjv;
  registration.guardCopy = guardCopy;
  registration.guardRefs = Object.keys(guardAjv.refs).filter((ref) => !refsBefore.includes(ref));
  return guardAjv;
};
