import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Keep undeclared array positions in slot order, including sparse positions.
 * @param node - Array branch whose templates determine the tail boundary
 * @param value - Interpreted whole-array input
 * @returns Undeclared tail or undefined when every position has a blueprint
 */
export const arrayExtras = <Self extends SchemaNodeRecord<Self>>(
  node: Self, value: readonly unknown[],
): unknown[] | undefined => {
  if (node.blueprintNode.item) return undefined;
  const start = isArray(node.blueprintNode.prefixItems) ?
    node.blueprintNode.prefixItems.length : 0;
  return value.length > start ? value.slice(start) : undefined;
};
