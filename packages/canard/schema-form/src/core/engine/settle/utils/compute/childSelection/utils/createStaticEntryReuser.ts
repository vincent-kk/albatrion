import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import type { BlueprintChildEntry } from '../../../../../blueprint';
import { HostStaticPartition } from '../../../../../blueprint';
import type { FieldNodeRecord } from '../../../../../record';
import type { SettlementContext } from '../../../../types/settlement';
import { relocatedGates } from '../../relocatedGates';
import { staticShape } from '../staticShape';

/** Static schemas indexed once per host shape, shared by prime and both selectors. */
const SHAPES = new WeakMap<
  object,
  Map<BlueprintChildEntry, NonNullable<ReturnType<typeof staticShape>>[number]>
>();

/**
 * Prepare one selection call to reuse only its fixed ungated entries.
 * @param node - Object host whose current structure is being selected
 * @param prior - Shape captured before this wheel's fixed baseline
 * @param context - Write scope and dirty child work
 * @param next - Destination structure, including the priming baseline
 * @param computeChild - Dirty-child computation, absent while priming
 * @param immediate - Whether child computation queues host publication
 * @returns An entry reuser, or undefined when this host call needs general selection
 */
export const createStaticEntryReuser = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  prior: Record<string, Self>,
  context: SettlementContext<Self>,
  next: Record<string, Self>,
  computeChild?: (child: Self) => void,
  immediate = false,
): ((entry: BlueprintChildEntry) => boolean) | undefined => {
  if (
    node.behavior.type !== 'object' ||
    context.kind === 'load' ||
    context.distributedInputs.has(node) ||
    context.pathChanges.length > 0 ||
    relocatedGates(node).length > 0
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
  let entries = SHAPES.get(shape);
  if (!entries) {
    entries = new Map(shape.map((selected) => [selected.entry, selected]));
    SHAPES.set(shape, entries);
  }
  const registered = context.presenceRegistrations;
  return (entry) => {
    if (
      context.presenceRegistrations !== registered ||
      context.pathChanges.length > 0 ||
      context.distributedInputs.has(node)
    )
      return false;
    const selected = entries.get(entry);
    const child = hasOwnProperty(prior, entry.name)
      ? prior[entry.name]
      : undefined;
    if (
      !selected ||
      !child ||
      child.parent !== node ||
      child.name !== entry.name ||
      child.path !== node.path + '/' + escapeSegment(entry.name) ||
      child.blueprintNode !== entry.node ||
      child.schema !== selected.schema ||
      !child.active ||
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
