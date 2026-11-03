import type { JSONSchema } from '@canard/schema-form';
import type Ajv from 'ajv';

import { makeSibling } from './makeSibling';
import type { SchemaRootRegistration } from './registerSchemaRoot';

/**
 * Materialize a first-error sibling only when a guard is requested.
 * The bound instance validates the copy, so its meta-schema validator serves guards and full
 * validation alike; the sibling compiles without validating again.
 * @param baseAjv - Bound instance that validates schemas
 * @param root - Authored root registered under the registration key
 * @param registration - Root registration that keeps the sibling
 * @returns The sibling that compiles this root's guards
 * @throws Error when the bound instance rejects the root against its meta-schema
 */
export const registerSchemaGuard = (
  baseAjv: Ajv,
  root: JSONSchema,
  registration: SchemaRootRegistration,
): Ajv => {
  if (registration.guardAjv) return registration.guardAjv;
  const guardCopy = structuredClone(root);
  if (baseAjv.opts.validateSchema !== false)
    baseAjv.validateSchema(guardCopy, true);
  const guardAjv = makeSibling(baseAjv, false, false);
  const refsBefore = Object.keys(guardAjv.refs);
  guardAjv.addSchema(guardCopy, registration.key);
  registration.guardAjv = guardAjv;
  registration.guardCopy = guardCopy;
  registration.guardRefs = Object.keys(guardAjv.refs).filter((ref) => !refsBefore.includes(ref));
  return guardAjv;
};
