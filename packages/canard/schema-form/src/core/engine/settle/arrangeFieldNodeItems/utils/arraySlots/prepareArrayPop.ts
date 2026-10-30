import type { Optional } from '@aileron/declare';

import type { ArrayOperation, FieldNodeRecord } from '../../../../record';
import type { ArrayPopProof } from '../../../types/settlement';
import { admitsStaticArrayTail } from './admitsStaticArrayTail';

/** A truncation plan constructs no slot; the retained prefix is never read. */
const NO_SLOTS: readonly never[] = Object.freeze([]);

/**
 * Admit a lone pop, or a remove of the last position, on a static array to the bounded truncation path without visiting its items.
 * Both verbs propose the same plan: keep positions 0..N-2 in place and report position N-1.
 * Writes nothing; every condition is a fixed number of reads, so a declined call costs O(1).
 * @param node - Write target of a public array verb, outside batch marking
 * @param operation - Requested structural operation
 * @returns Call-local pop proof, or undefined when the general plan must run
 */
export const prepareArrayPop = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  operation: ArrayOperation,
): Optional<ArrayPopProof<Self>> => {
  const count = node.itemCount;
  const index = count - 1;
  if (
    (operation.kind !== 'pop' &&
      (operation.kind !== 'remove' || operation.index !== index)) ||
    index < (node.blueprintNode.prefixItems?.length ?? 0) ||
    !admitsStaticArrayTail(node)
  )
    return undefined;
  const last = node.structure?.[String(index)];
  if (!last || node.children?.[index] !== last) return undefined;
  return {
    host: node,
    count,
    plan: {
      kind: 'slots',
      slots: NO_SLOTS,
      result: { source: 'removed', index },
    },
    local: node.local,
    valid: true,
  };
};
