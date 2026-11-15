import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../../record';
import { isPlain } from '../isPlain';

/**
 * Tell whether a host write keeps the key set (object) or the item count (array) of the host's previous stored value.
 * Reads each input key once; the caller has already proven the source, extras and item count unchanged.
 * @param node - Branch host whose stored value still holds the previous commit's assembly
 * @param value - Interpreted host input
 * @param isMerge - Whether omitted keys are retained, so only supplied keys must already exist
 * @returns For an array, whether input and previous stored value are arrays of the current item count; for an object, whether every input key has a defined value and exists in the previous stored value, with an equal key count unless merging
 */
export const keepsHostKeys = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value: unknown,
  isMerge: boolean,
): boolean => {
  const previousValue = node.storedValue;
  if (node.behavior.type === 'array')
    return (
      isArray(value) &&
      isArray(previousValue) &&
      previousValue.length === node.itemCount
    );
  if (!isPlain(value) || !isPlain(previousValue)) return false;
  const keys = Object.keys(value);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (value[key] === undefined || !hasOwnProperty(previousValue, key))
      return false;
  }
  return isMerge || keys.length === Object.keys(previousValue).length;
};
