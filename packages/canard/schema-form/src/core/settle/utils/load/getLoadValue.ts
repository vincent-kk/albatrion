import { unescapeSegment } from '@winglet/json/pointer';

/**
 * Read one node's immutable load source from the root snapshot.
 * @param snapshot - Last values explicitly loaded by the form
 * @param path - Absolute JSON Pointer of the node
 * @returns The exact retained source reference, or undefined when absent
 */
export const getLoadValue = (snapshot: unknown, path: string): unknown => {
  if (!path) return snapshot;
  let value = snapshot;
  for (const encoded of path.slice(1).split('/')) {
    if (value === null || typeof value !== 'object') return undefined;
    value = Reflect.get(value, unescapeSegment(encoded));
  }
  return value;
};
