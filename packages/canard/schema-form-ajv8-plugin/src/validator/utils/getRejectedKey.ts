import type { ErrorObject } from 'ajv';

import type { Dictionary } from '@aileron/declare';

import { isChildSchemaPath } from './isChildSchemaPath';

/**
 * Resolves an authored subschema from a schema path local to the root.
 * @param root - Authored root supplied to error transformation.
 * @param path - Schema path; only a `#/` fragment is local to the root. AJV percent-encodes each
 *   segment of the fragment after JSON Pointer escaping, so a segment is decoded in that order.
 * @returns The referenced subschema, or undefined when the path is outside the root's fragment
 *   (another resource such as `urn:item/not`) or names no schema.
 */
const schemaAtPath = (root: unknown, path: string): unknown => {
  if (!path.startsWith('#/')) return undefined;
  let current = root;
  for (const part of path.slice(2).split('/')) {
    if (typeof current !== 'object' || current === null) return undefined;
    const segment = part.includes('%') ? decodeURIComponent(part) : part;
    current = (current as Dictionary<unknown>)[
      segment.includes('~') ? segment.replace(/~1/g, '/').replace(/~0/g, '~') : segment
    ];
  }
  return current;
};

/**
 * Finds a rejected property when AJV or a single-key negative schema identifies it.
 * @param error - AJV issue whose keyword determines the key source.
 * @param schemaPath - The issue's schema path, already rewritten to the authored fragment.
 * @param root - Authored schema for negative-required lookup.
 * @param notRequiredKeys - Lookups already made for this root, by schema path, misses included; a
 *   `not` issue reads from it before walking the root and stores what the walk found.
 * @returns The property name, or undefined for host-only issues.
 */
export const getRejectedKey = (
  error: ErrorObject,
  schemaPath: string,
  root: unknown,
  notRequiredKeys?: Map<string, string | undefined>,
): string | undefined => {
  // AJV names the key on every issue raised inside `propertyNames`; the closing issue carries it in params.
  if (typeof error.propertyName === 'string') return error.propertyName;
  if (error.keyword === 'additionalProperties' || error.keyword === 'unevaluatedProperties') {
    const property = error.params.additionalProperty ?? error.params.unevaluatedProperty;
    return typeof property === 'string' ? property : undefined;
  }
  if (error.keyword === 'propertyNames')
    return typeof error.params.propertyName === 'string' ? error.params.propertyName : undefined;
  if (error.keyword === 'false schema' && error.instancePath && isChildSchemaPath(schemaPath)) {
    const name = error.instancePath.slice(error.instancePath.lastIndexOf('/') + 1);
    return name.includes('~') ? name.replace(/~1/g, '/').replace(/~0/g, '~') : name;
  }
  if (error.keyword !== 'not') return undefined;
  if (notRequiredKeys?.has(schemaPath)) return notRequiredKeys.get(schemaPath);
  const schema = schemaAtPath(root, schemaPath);
  const required = typeof schema === 'object' && schema !== null ? (schema as Dictionary<unknown>).required : undefined;
  const key = Array.isArray(required) && required.length === 1 && typeof required[0] === 'string'
    ? required[0]
    : undefined;
  notRequiredKeys?.set(schemaPath, key);
  return key;
};
