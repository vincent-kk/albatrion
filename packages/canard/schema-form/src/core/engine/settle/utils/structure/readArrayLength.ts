import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../record';

/**
 * Read an array node's current length without settling it.
 * @param node - Record whose length a push reports when the array does not grow
 * @returns Item count of a branch, length of a terminal's raw array, or 0 for any other raw
 */
export const readArrayLength = <Self extends FieldNodeRecord<Self>>(
  node: FieldNodeRecord<Self>,
): number =>
  node.behavior.strategy === 'branch'
    ? node.itemCount
    : isArray(node.raw)
      ? node.raw.length
      : 0;
