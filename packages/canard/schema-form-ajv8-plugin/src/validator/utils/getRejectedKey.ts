import type { ErrorObject } from 'ajv';

import type { Dictionary } from '@aileron/declare';

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
    current = (current as Dictionary<unknown>)[segment.replace(/~1/g, '/').replace(/~0/g, '~')];
  }
  return current;
};

/**
 * Finds a rejected property when AJV or a single-key negative schema identifies it.
 * @param error - AJV issue whose keyword determines the key source.
 * @param schemaPath - The issue's schema path, already rewritten to the authored fragment.
 * @param root - Authored schema for negative-required lookup.
 * @returns The property name, or undefined for host-only issues.
 */
export const getRejectedKey = (error: ErrorObject, schemaPath: string, root: unknown): string | undefined => {
  if (error.keyword === 'additionalProperties' || error.keyword === 'unevaluatedProperties') {
    const property = error.params.additionalProperty ?? error.params.unevaluatedProperty;
    return typeof property === 'string' ? property : undefined;
  }
  if (error.keyword === 'propertyNames')
    return typeof error.params.propertyName === 'string' ? error.params.propertyName : undefined;
  if (error.keyword === 'false schema' && error.instancePath)
    return error.instancePath?.split('/').at(-1)?.replace(/~1/g, '/').replace(/~0/g, '~');
  if (error.keyword !== 'not') return undefined;
  const schema = schemaAtPath(root, schemaPath);
  if (typeof schema !== 'object' || schema === null) return undefined;
  const required = (schema as Dictionary<unknown>).required;
  return Array.isArray(required) && required.length === 1 && typeof required[0] === 'string'
    ? required[0]
    : undefined;
};
