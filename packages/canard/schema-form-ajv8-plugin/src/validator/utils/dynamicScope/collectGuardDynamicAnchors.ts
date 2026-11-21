import type { Ajv } from 'ajv';
import type { ValidateFunction } from 'ajv';

import type { Dictionary } from '@aileron/declare';

import { collectResourceAnchors } from './collectResourceAnchors';
import { findUnboundGuardReferences } from './findUnboundGuardReferences';
import { opensSchemaResource } from './opensSchemaResource';
import { SCHEMA_DICTIONARY_KEYWORDS } from './schemaKeywords';

/**
 * Build the dynamic-anchor table a guard needs from its chain resources; call it before compiling the guard,
 * because AJV decides at compile time, from the root's anchor flags, whether a dynamic reference reads the table.
 * The chain resources are the root and every ancestor on the pointer path that opens a resource with its own
 * `$id`, outermost first. Each anchor name binds to its declaration in the outermost chain resource that declares
 * it (`$recursiveAnchor: true` only at a resource root, under `''`), outside the guard's own subtree; AJV's
 * truthiness check on a plain `{}` decides whether a name is taken.
 * @param root - The registered root copy in which the pointer locates a schema.
 * @param key - The reference under which `ajv` holds the root; locations resolve as `key#<pointer>`.
 * @param pointer - The guard's JSON Pointer, or a percent-encoded URI fragment prefixed with #.
 * @param ajv - The guard instance holding the root; it compiles every selected declaration.
 * @returns A table from anchor name to the selected declaration's validate function; empty when nothing binds.
 * @throws Error when AJV resolves no schema for a selected declaration, when a selected declaration is
 * asynchronous, or when the guard references inline a name that neither a chain resource nor an ancestor of the
 * reference inside the guard declares, including a `#/…` JSON Pointer fragment, which AJV reads as an anchor name.
 */
export const collectGuardDynamicAnchors = (
  root: object,
  key: string,
  pointer: string,
  ajv: Ajv,
): Dictionary<ValidateFunction> => {
  const resources: { path: string; schema: object }[] = [{ path: '', schema: root }];
  const fragment = pointer.startsWith('#');
  const tokens = (fragment ? pointer.slice(1) : pointer).split('/').slice(1);
  let schema: unknown = root;
  let path = '';
  let dictionary = false;
  for (let depth = 0; depth < tokens.length; depth++) {
    if (typeof schema !== 'object' || schema === null) break;
    const raw = tokens[depth];
    const token = (fragment ? decodeURIComponent(raw) : raw).replace(/~1/g, '/').replace(/~0/g, '~');
    dictionary = !dictionary && !Array.isArray(schema) && SCHEMA_DICTIONARY_KEYWORDS.has(token);
    path += `/${token.replace(/~/g, '~0').replace(/\//g, '~1')}`;
    schema = Reflect.get(schema, token);
    if (depth < tokens.length - 1 && !dictionary && typeof schema === 'object' && schema !== null &&
      !Array.isArray(schema) && opensSchemaResource(schema))
      resources.push({ path, schema });
  }
  const anchors: Dictionary<ValidateFunction> = {};
  for (const resource of resources)
    for (const [name, at] of collectResourceAnchors(resource.schema, schema)) {
      if (anchors[name]) continue;
      const location = `${resource.path}${at}`;
      anchors[name] = resolveAnchorTarget(ajv, location ? `${key}#${location.split('/').map(encodeURIComponent).join('/')}` : key);
    }
  const unbound = findUnboundGuardReferences(schema, (name) => !!anchors[name]);
  if (unbound.length)
    throw new Error(
      unbound[0].startsWith('/')
        ? `Guard dynamic reference #${unbound[0]} is not bound: a JSON Pointer fragment is not an anchor name, so no declaration can bind it; use $ref for a location`
        : `Guard dynamic reference #${unbound[0]} is not bound: move the anchor to an ancestor of the reference (for example the root of the allOf element that contains it) or to a chain resource`,
    );
  return anchors;
};

/** The synchronous validate function AJV holds for a location reference; throws when absent or asynchronous. */
const resolveAnchorTarget = (ajv: Ajv, target: string): ValidateFunction => {
  const validate = ajv.getSchema(target);
  if (validate === undefined)
    throw new Error(`Registered Ajv guard anchor was not found: ${target}`);
  if ('$async' in validate && validate.$async === true)
    throw new Error('async schema in sync schema');
  return validate;
};
