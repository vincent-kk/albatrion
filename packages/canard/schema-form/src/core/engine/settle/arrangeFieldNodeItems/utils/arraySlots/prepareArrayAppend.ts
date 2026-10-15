import { getItemEntry, mergeEffectiveSchema } from '../../../../blueprint';
import type { ArrayOperation, FieldNodeRecord } from '../../../../record';
import type { ArrayAppendProof } from '../../../types/settlement';
import { admitsStaticArrayTail } from './admitsStaticArrayTail';

/** Ungated effective schemas select their immutable static contributions. */
const NO_ACTIVE_IDS: readonly number[] = Object.freeze([]);

/** Shared result reporting the array length after a push or an insert. */
const LENGTH_RESULT = { source: 'length' } as const;

/**
 * Admit a lone push, or an insert at the current length, on a static array to the bounded append path without visiting its items.
 * Writes nothing; every condition is a fixed number of reads, so a declined call costs O(1).
 * @param node - Write target of a public array verb, outside batch marking
 * @param operation - Requested structural operation
 * @returns Call-local append proof, or undefined when the general plan must run
 */
export const prepareArrayAppend = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  operation: ArrayOperation,
): ArrayAppendProof<Self> | undefined => {
  const count = node.itemCount;
  if (
    operation.kind !== 'push' &&
    (operation.kind !== 'insert' || operation.index !== count)
  )
    return undefined;
  const template = node.blueprintNode;
  if (
    !admitsStaticArrayTail(node) ||
    count < (template.prefixItems?.length ?? 0)
  )
    return undefined;
  const entry = getItemEntry(template, count);
  if (!entry || entry.node.kind === 'virtual' || !entry.declarations.length)
    return undefined;
  const schema = mergeEffectiveSchema(entry.node, NO_ACTIVE_IDS, {
    mode: 'runtime',
    isAtomic: node.runtime.blueprint.isAtomic,
  });
  if (schema.typeConflict) return undefined;
  return {
    host: node,
    count,
    entry,
    schema,
    plan: {
      kind: 'slots',
      slots: [{ value: operation.value }],
      result: LENGTH_RESULT,
    },
    local: node.local,
    valid: true,
  };
};
