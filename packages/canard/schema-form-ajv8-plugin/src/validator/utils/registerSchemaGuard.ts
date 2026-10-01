import type { JSONSchema } from '@canard/schema-form';
import type Ajv from 'ajv';

import { makeSibling } from './makeSibling';
import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Materialize a first-error sibling only when a guard is requested. */
export const registerSchemaGuard = (
  baseAjv: Ajv,
  root: JSONSchema,
  registration: SchemaRootRegistration,
): Ajv => {
  if (registration.guardAjv) return registration.guardAjv;
  const guardAjv = makeSibling(baseAjv, false);
  const guardCopy = structuredClone(root);
  const refsBefore = Object.keys(guardAjv.refs);
  guardAjv.addSchema(guardCopy, registration.key);
  registration.guardAjv = guardAjv;
  registration.guardCopy = guardCopy;
  registration.guardRefs = Object.keys(guardAjv.refs).filter((ref) => !refsBefore.includes(ref));
  return guardAjv;
};
