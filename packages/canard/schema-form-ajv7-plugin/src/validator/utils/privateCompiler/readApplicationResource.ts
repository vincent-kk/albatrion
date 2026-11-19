import { normalizeId } from 'ajv/dist/compile/resolve.js';

import type { AjvInstance as Ajv } from '../../types/AjvInstance';
import { readApplicationEntry } from './readApplicationEntry';
import { readPointer } from './readPointer';
import type { ApplicationEntry, ApplicationResource } from './types';

/**
 * Follow current application aliases and raw document pointers without compiling them.
 * @param source - Read-only application registry owner.
 * @param requested - Normalized reference address to resolve through aliases and pointers.
 * @param observations - Receives every visited key, including missing keys needed to detect later registration.
 * @returns Current raw document and target, or undefined for an unresolved address.
 */
export const readApplicationResource = (
  source: Ajv,
  requested: string,
  observations = new Map<string, ApplicationEntry>(),
): ApplicationResource | undefined => {
  const visited = new Set<string>();
  let key = normalizeId(requested);
  let fragment: string | undefined;
  for (;;) {
    if (visited.has(key)) return undefined;
    visited.add(key);
    const entry = readApplicationEntry(source, key);
    observations.set(key, entry);
    let value = entry.schema ?? entry.ref;
    if (
      value &&
      typeof value === 'object' &&
      'schema' in value &&
      'root' in value &&
      value.root &&
      typeof value.root === 'object' &&
      'schema' in value.root &&
      value.root.schema !== value.schema &&
      key.includes('#')
    )
      value = undefined;
    if (typeof value === 'string') {
      key = normalizeId(value);
      continue;
    }
    if (value && typeof value === 'object' && 'schema' in value) {
      const schema = value.schema;
      if (
        typeof schema !== 'boolean' &&
        (!schema || typeof schema !== 'object')
      )
        return undefined;
      const target =
        fragment === undefined ? schema : readPointer(schema, fragment);
      if (target === undefined) return undefined;
      return {
        document: schema,
        target,
        key,
        meta: !!Reflect.get(value, 'meta'),
        observations,
      };
    }
    const hash = key.indexOf('#');
    if (hash < 0) return undefined;
    const pointer = key.slice(hash + 1);
    if (pointer && pointer[0] !== '/') return undefined;
    fragment = pointer;
    key = normalizeId(key.slice(0, hash));
  }
};
