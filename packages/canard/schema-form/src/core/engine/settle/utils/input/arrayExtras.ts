import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import { sameValue } from '../../../utils/compute/sameValue';

/**
 * Keep undeclared array positions in slot order, including sparse positions.
 * @param node - Array branch whose templates determine the tail boundary
 * @param value - Interpreted whole-array input
 * @returns Previous equal tail, new tail, or undefined when every position has a blueprint
 */
export const arrayExtras = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value: readonly unknown[],
): Optional<unknown[]> => {
  if (node.blueprintNode.item) return undefined;
  const start = isArray(node.blueprintNode.prefixItems)
    ? node.blueprintNode.prefixItems.length
    : 0;
  const next = value.length > start ? value.slice(start) : undefined;
  const previous = node.undeclaredValues;
  return isArray(previous) && sameValue(previous, next) ? previous : next;
};
