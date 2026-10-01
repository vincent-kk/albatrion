import type { ErrorObject } from 'ajv';

/**
 * Resolves an authored subschema from an AJV fragment path.
 * @param root - Authored root supplied to error transformation.
 * @param path - AJV schema path, possibly prefixed by an absolute URI.
 * @returns The referenced subschema, or undefined when it is not local.
 */
const schemaAtPath = (root: unknown, path: string): unknown => {
  const fragment = path.slice(path.indexOf('#') + 1);
  if (!fragment.startsWith('/')) return root;
  let current = root;
  for (const part of fragment.slice(1).split('/')) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[part.replace(/~1/g, '/').replace(/~0/g, '~')];
  }
  return current;
};

/**
 * Finds a rejected property when AJV or a single-key negative schema identifies it.
 * @param error - AJV issue whose keyword determines the key source.
 * @param root - Authored schema for negative-required lookup.
 * @returns The property name, or undefined for host-only issues.
 */
export const getRejectedKey = (error: ErrorObject, root: unknown): string | undefined => {
  if (error.keyword === 'additionalProperties' || error.keyword === 'unevaluatedProperties') {
    const property = error.params.additionalProperty ?? error.params.unevaluatedProperty;
    return typeof property === 'string' ? property : undefined;
  }
  if (error.keyword === 'propertyNames')
    return typeof error.params.propertyName === 'string' ? error.params.propertyName : undefined;
  if (error.keyword === 'false schema' && error.instancePath)
    return error.instancePath?.split('/').at(-1)?.replace(/~1/g, '/').replace(/~0/g, '~');
  if (error.keyword !== 'not') return undefined;
  const schema = schemaAtPath(root, error.schemaPath);
  if (typeof schema !== 'object' || schema === null) return undefined;
  const required = (schema as Record<string, unknown>).required;
  return Array.isArray(required) && required.length === 1 && typeof required[0] === 'string'
    ? required[0]
    : undefined;
};
