import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { FieldNodeWriteKind } from '../../../types/value';
import type { SettlementContext } from '../../types/settlement';
import { writeSlotPath } from './writeSlotPath';

/**
 * Write one virtual group slot whose constituent has no live node at its own address, for a
 * caller write to the group. A caller load writes even an undefined input, which replaces the
 * address whole as the constituent's own reset does; any other write retains a defined value in the
 * constituent's slot and ignores undefined. The whole slot write itself replaces the address and
 * every other candidate kind there, and registers the host for slot publication, so no separate
 * pruning or host recompute is needed.
 * @param context - Active write whose root owns the retained sources
 * @param hostPath - Absolute address of the constituent's owner
 * @param entry - Declared constituent entry selected by name
 * @param input - Tuple value for this slot
 * @param isWhole - Whether the constituent's missing descendants are replaced
 * @returns Nothing; slot changes are recorded on the context for commit and rollback
 */
export const writeAbsentConstituent = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  hostPath: string,
  entry: BlueprintChildEntry,
  input: unknown,
  isWhole: boolean,
): void => {
  const isLoad =
    context.kind === FieldNodeWriteKind.Load && !context.isAutomatic;
  if (input === undefined && !isLoad) return;
  writeSlotPath(
    context.root,
    appendSegment(hostPath, entry.name),
    entry.node,
    input,
    isWhole,
    context,
    context.isAutomatic,
  );
};
