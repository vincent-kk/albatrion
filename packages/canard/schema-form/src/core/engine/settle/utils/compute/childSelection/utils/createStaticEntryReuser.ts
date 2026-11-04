import { map as mapArray } from '@winglet/common-utils/array';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary, Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry } from '../../../../../blueprint';
import { HostStaticPartition } from '../../../../../blueprint';
import type { FieldNodeRecord } from '../../../../../record';
import { getHostDerived } from '../../../../../utils/cache/derivedRecords';
import type { SettlementContext } from '../../../../types/settlement';
import { staticShape } from '../staticShape';
import type { StaticShapeMemo } from '../staticShape';

/** Static schemas indexed once per host shape, shared by prime and both selectors. */

/**
 * Prepare one selection call to reuse only its fixed ungated entries.
 * @param node - Object host whose current structure is being selected
 * @param prior - Shape captured before this wheel's fixed baseline
 * @param context - Write scope and dirty child work
 * @param next - Destination structure, including the priming baseline
 * @param computeChild - Dirty-child computation, absent while priming
 * @param immediate - Whether child computation queues host publication
 * @param hasRelocated - Existing wheel evidence; unknown callers keep the general path
 * @returns An entry reuser, or undefined when this host call needs general selection
 */
export const createStaticEntryReuser = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  prior: Dictionary<Self>,
  context: SettlementContext<Self>,
  next: Dictionary<Self>,
  computeChild?: (child: Self) => void,
  immediate = false,
  hasRelocated = true,
): Optional<(entry: BlueprintChildEntry) => boolean> => {
  if (
    node.behavior.type !== 'object' ||
    context.kind === 'load' ||
    context.distributedInputs.has(node) ||
    context.pathChanges.length > 0 ||
    hasRelocated
  )
    return undefined;
  const partition = HostStaticPartition.get(node.blueprintNode);
  if (!partition.staticEntries.length) return undefined;
  const shape = staticShape(
    node.blueprintNode,
    node.runtime.blueprint.isAtomic,
    partition.staticEntries,
  );
  if (!shape) return undefined;
  const memo = getHostDerived<'staticShape', StaticShapeMemo>(
    node.blueprintNode,
  ).staticShape!;
  let entries = memo.byEntry;
  if (!entries) {
    entries = new Map(
      mapArray(shape, (selected) => [selected.entry, selected]),
    );
    memo.byEntry = entries;
  }
  const registered = context.presenceRegistrations;
  const ownNames = Object.getPrototypeOf(prior) === null;
  return (entry) => {
    if (
      context.presenceRegistrations !== registered ||
      context.pathChanges.length > 0 ||
      context.distributedInputs.has(node)
    )
      return false;
    const selected = entries.get(entry);
    const child =
      ownNames || hasOwnProperty(prior, entry.name)
        ? prior[entry.name]
        : undefined;
    if (
      !selected ||
      !child ||
      child.parent !== node ||
      child.name !== entry.name ||
      child.path !== appendSegment(node.path, entry.name) ||
      child.blueprintNode !== entry.node ||
      child.schema !== selected.schema ||
      !child.isActive ||
      child.detached ||
      node.structure?.[entry.name] !== child ||
      (next[entry.name] !== undefined && next[entry.name] !== child)
    )
      return false;
    next[entry.name] = child;
    if (context.selectedDeclarationIds.get(child) !== selected.ids)
      context.selectedDeclarationIds.set(child, selected.ids);
    if (computeChild && context.dirtyPaths.has(child.path)) {
      computeChild(child);
      if (immediate) (context.pendingOutputs ??= new Set()).add(node);
    }
    return true;
  };
};
