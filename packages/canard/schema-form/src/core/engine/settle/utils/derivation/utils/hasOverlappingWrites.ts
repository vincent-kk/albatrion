import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import type { DeriveRoundDecision } from '../../../../derive';
import type { FieldNodeRecord } from '../../../../record';
import { readWriteAddresses } from './readWriteAddresses';

/** Code unit of the JSON Pointer separator. */
const SEPARATOR = 47;

/** Order pointers depth-first: the separator sorts below every other code unit. */
const compareTree = (left: string, right: string): number => {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index++) {
    const a = left.charCodeAt(index);
    const b = right.charCodeAt(index);
    if (a !== b) return (a === SEPARATOR ? -1 : a) - (b === SEPARATOR ? -1 : b);
  }
  return left.length - right.length;
};

/**
 * Tell whether two winners of one round write the same or nested storage addresses.
 * In depth-first order a descendant follows its ancestor with only that ancestor's descendants
 * between them, so an overlap always shows in some adjacent pair.
 * @param writes - Winners of one derive round, two or more
 * @returns Whether any address equals, contains or lies inside another winner's address
 * @remarks O(A log A) over the A storage addresses; nothing is computed or applied.
 */
export const hasOverlappingWrites = <Self extends FieldNodeRecord<Self>>(
  writes: readonly DeriveRoundDecision<Self>['writes'][number][],
): boolean => {
  const addresses: string[] = [];
  for (let index = 0; index < writes.length; index++)
    addresses.push(...readWriteAddresses(writes[index]));
  addresses.sort(compareTree);
  for (let index = 1; index < addresses.length; index++) {
    const previous = addresses[index - 1];
    const current = addresses[index];
    if (previous === current || isDescendantPath(current, previous)) return true;
  }
  return false;
};
