import type { Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { FieldNodeWriteKind } from '../../../types/value';
import type { SettlementContext } from '../../types/settlement';
import { pruneInactiveSources } from './pruneInactiveSources';
import { writeSlotPath } from './writeSlotPath';

/**
 * Write one virtual group slot whose constituent has no live node at its own address.
 * A caller load clears the address's retained sources first, as the constituent's own reset does;
 * any other write retains a defined value in the constituent's slot and ignores undefined.
 * @param context - Active write whose root owns the retained sources
 * @param host - Live owner of the constituent, absent when the owner is itself latent
 * @param hostPath - Absolute address of the constituent's owner
 * @param entry - Declared constituent entry selected by name
 * @param input - Tuple value for this slot
 * @param isWhole - Whether the constituent's missing descendants are replaced
 * @returns Nothing; slot changes are recorded on the context for commit and rollback
 */
export const writeAbsentConstituent = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  host: Optional<Self>,
  hostPath: string,
  entry: BlueprintChildEntry,
  input: unknown,
  isWhole: boolean,
): void => {
  const isLoad =
    context.kind === FieldNodeWriteKind.Load && !context.isAutomatic;
  if (input === undefined && !isLoad) return;
  const path = appendSegment(hostPath, entry.name);
  if (isLoad)
    pruneInactiveSources(context.root.runtime, path, undefined, context);
  writeSlotPath(
    context.root,
    path,
    entry.node,
    input,
    isWhole,
    context,
    context.isAutomatic,
  );
  if (host) context.dirtyPaths.add(host.path);
};
