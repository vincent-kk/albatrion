import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { setDataProperty } from '@winglet/common-utils/object';

import { parsePointerSegments } from '@/schema-form/helpers/jsonPointer';

import { isNamedPointerSegments } from '../../../utils/paths/isNamedPointerSegments';
import { sameValue } from '../../../utils/compute/sameValue';
import { getLoadValue } from './getLoadValue';

/**
 * Replace one snapshot path by copying only the ancestors above it.
 * @param snapshot - Previous form load source
 * @param path - Absolute JSON Pointer of the new load
 * @param value - Caller-owned immutable load value
 * @returns New root snapshot retaining all unrelated references
 */
export const setLoadValue = (
  snapshot: unknown,
  path: string,
  value: unknown,
): unknown => {
  if (!path) return sameValue(snapshot, value) ? snapshot : value;
  const segments = parsePointerSegments(path);
  if (sameValue(getLoadValue(snapshot, path, segments), value)) return snapshot;
  if (!isNamedPointerSegments(segments)) return snapshot;
  const ancestors: unknown[] = [snapshot];
  let source = snapshot;
  for (const segment of segments) {
    source =
      source !== null && typeof source === 'object' && hasOwnProperty(source, segment)
        ? Reflect.get(source, segment)
        : undefined;
    ancestors.push(source);
  }
  let next = value;
  for (let index = segments.length - 1; index >= 0; index--) {
    const parent = ancestors[index];
    const copy = isArray(parent)
      ? [...parent]
      : parent !== null && typeof parent === 'object'
        ? { ...parent }
        : {};
    setDataProperty(copy, segments[index], next);
    next = copy;
  }
  return next;
};
