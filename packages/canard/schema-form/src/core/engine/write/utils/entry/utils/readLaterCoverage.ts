import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  isDescendantPath,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import { WriteOption } from '../../../../types/value';

/** A batch mark reduced to the storage addresses it writes and how. */
export type LaterMark = {
  readonly paths: readonly string[];
  readonly option: WriteOption;
  readonly value: unknown;
};

/** How a later mark reaches one storage address: whole, not at all, or as an object it merges in. */
export type LaterCoverage =
  | { readonly kind: 'covered' }
  | { readonly kind: 'disjoint' }
  | { readonly kind: 'merged'; readonly value: object };

/**
 * Read how a later batch mark writes one address. A replacement at the address or above it covers
 * it whole. A Merge above it covers it whole when its value replaces a step on the way or the
 * address itself with a non-object, misses it when a key on the way is absent, and merges into it
 * when its value at the address is a plain object (write DETAIL EVENT-013).
 * @param path - Storage address of the earlier mark
 * @param later - Storage paths, option and value of the later mark; a virtual mark's value is its tuple
 * @returns The coverage; for `merged`, the later value at the address
 */
export const readLaterCoverage = (
  path: string,
  later: LaterMark,
): LaterCoverage => {
  const isMerge =
    (later.option & WriteOption.Merge) === WriteOption.Merge &&
    !(later.option & WriteOption.Replace);
  for (let index = 0; index < later.paths.length; index++) {
    const scope = later.paths[index];
    if (path !== scope && !isDescendantPath(path, scope)) continue;
    if (!isMerge) return { kind: 'covered' };
    let current =
      later.paths.length > 1
        ? isArray(later.value)
          ? later.value[index]
          : undefined
        : later.value;
    let isReached = true;
    for (const name of parsePointerSegments(path.slice(scope.length))) {
      if (current === null || typeof current !== 'object' || isArray(current))
        return { kind: 'covered' };
      if (typeof name !== 'string' || !hasOwnProperty(current, name)) {
        isReached = false;
        break;
      }
      current = Reflect.get(current, name);
    }
    if (!isReached) continue;
    if (current === null || typeof current !== 'object' || isArray(current))
      return { kind: 'covered' };
    return { kind: 'merged', value: current };
  }
  return { kind: 'disjoint' };
};
