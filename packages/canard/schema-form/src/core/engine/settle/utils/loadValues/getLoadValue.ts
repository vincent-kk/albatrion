import {
  type PointerSegment,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

/**
 * Read one node's immutable load source from the root snapshot.
 * @param snapshot - Last values explicitly loaded by the form
 * @param path - Absolute JSON Pointer of the node
 * @param segments - Optional prepared syntax for repeated reads
 * @returns The exact retained source reference, or undefined when absent
 */
export const getLoadValue = (
  snapshot: unknown,
  path: string,
  segments?: readonly PointerSegment[],
): unknown => {
  if (!path) return snapshot;
  let value = snapshot;
  for (const name of segments ?? parsePointerSegments(path)) {
    if (value === null || typeof value !== 'object') return undefined;
    if (typeof name !== 'string') return undefined;
    value = Reflect.get(value, name);
  }
  return value;
};
