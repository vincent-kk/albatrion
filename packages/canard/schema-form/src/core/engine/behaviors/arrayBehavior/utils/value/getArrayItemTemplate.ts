import type { Optional } from '@aileron/declare';

import type { BlueprintNode } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';

/**
 * Read the selected template of a live slot, falling back to its first authored candidate.
 * @param node - Array calculation view with opaque generic children
 * @param index - Nonnegative slot position
 * @returns Selected or first blueprint, or undefined for an undeclared position
 */
export const getArrayItemTemplate = (
  node: Pick<FieldNodeRecord<unknown>, 'blueprintNode' | 'structure'>,
  index: number,
): Optional<BlueprintNode> => {
  const child = node.structure?.[String(index)];
  const candidates = node.blueprintNode.prefixItems?.[index]
    ? node.blueprintNode.prefixItemCandidates?.[index]
    : node.blueprintNode.itemCandidates;
  const selected =
    child !== null && typeof child === 'object' && 'blueprintNode' in child
      ? candidates?.find((candidate) => candidate === child.blueprintNode)
      : undefined;
  if (candidates) return selected ?? candidates[0];
  return node.blueprintNode.prefixItems?.[index] ?? node.blueprintNode.item;
};
