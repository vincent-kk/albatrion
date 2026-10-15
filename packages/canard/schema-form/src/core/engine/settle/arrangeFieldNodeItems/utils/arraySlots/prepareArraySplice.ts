import { getItemEntry, mergeEffectiveSchema } from '../../../../blueprint';
import type { ArrayOperation, FieldNodeRecord } from '../../../../record';
import type { ArraySpliceProof } from '../../../types/settlement';
import { admitsStaticArrayTail } from './admitsStaticArrayTail';

/** Ungated effective schemas select their immutable static contributions. */
const NO_ACTIVE_IDS: readonly number[] = Object.freeze([]);

/** Shared result reporting the array length after an insert. */
const LENGTH_RESULT = { source: 'length' } as const;

/** A removal's splice constructs no slot; the tail is read from the live structure. */
const NO_SLOTS: readonly never[] = Object.freeze([]);

/**
 * Admit a middle remove or insert on a static array to the splice path, which rebuilds only the tail from the edited position.
 * Removal admits 0 <= index < N-1 and insertion 0 <= index < N; the last position stays with the pop and append paths.
 * The shared static admission is a fixed number of reads; the tail check reads the T = N - index tail positions only.
 * Writes nothing.
 * @param node - Write target of a public array verb, outside batch marking
 * @param operation - Requested structural operation
 * @returns Call-local splice proof, or undefined when the row's plan and the general path must run
 */
export const prepareArraySplice = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  operation: ArrayOperation,
): ArraySpliceProof<Self> | undefined => {
  if (operation.kind !== 'remove' && operation.kind !== 'insert')
    return undefined;
  const count = node.itemCount;
  const index = operation.index;
  const template = node.blueprintNode;
  if (
    !Number.isInteger(index) ||
    index < (template.prefixItems?.length ?? 0) ||
    index >= (operation.kind === 'remove' ? count - 1 : count) ||
    !admitsStaticArrayTail(node)
  )
    return undefined;
  const items = node.structure;
  const children = node.children;
  for (let position = index; position < count; position++) {
    const item = items?.[String(position)];
    if (
      !item ||
      children?.[position] !== item ||
      item.name !== String(position) ||
      item.blueprintNode !== template.item
    )
      return undefined;
  }
  if (operation.kind === 'remove')
    return {
      host: node,
      count,
      index,
      plan: {
        kind: 'slots',
        slots: NO_SLOTS,
        result: { source: 'removed', index },
      },
    };
  const entry = getItemEntry(template, index);
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
    index,
    entry,
    schema,
    plan: {
      kind: 'slots',
      slots: [{ value: operation.value }],
      result: LENGTH_RESULT,
    },
  };
};
