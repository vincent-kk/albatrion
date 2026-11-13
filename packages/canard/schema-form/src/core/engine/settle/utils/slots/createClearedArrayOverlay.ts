import type { Fn, Optional } from '@aileron/declare';

import { getItemEntries } from '../../../blueprint';
import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';
import { materializeKeptSlotOverlay } from './materializeKeptSlotOverlay';
import { readSlotSourceTree } from './readSlotSourceTree';

/** Recursive exit resolver supplied by the owner to keep dependencies acyclic. */
type ResolveExit<Self extends FieldNodeRecord<Self>> = Fn<
  [
    node: Self,
    inherited: boolean,
    applyPolicy: boolean,
    previous?: InactiveSlotOverlay,
    context?: SettlementContext<Self>,
    sourceContext?: SettlementContext<Self>,
  ],
  {
    readonly overlay: Optional<InactiveSlotOverlay>;
    readonly hasSource: boolean;
  }
>;

/**
 * Pack only items whose recursively resolved exit preserves a source.
 * @param node - Clearing array whose old instances and addresses remain frozen
 * @param previous - Existing input patches covering the departing array
 * @param context - Last-live exit inputs, absent for already inactive sources
 * @param resolve - Owner's ordinary object/terminal exit-policy traversal
 * @param sourceContext - Call-local plan owner, also available for inactive sources
 * @returns A replacement with compacted source and independently bound child patches
 */
export const createClearedArrayOverlay = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  previous: Optional<InactiveSlotOverlay>,
  context: Optional<SettlementContext<Self>>,
  resolve: ResolveExit<Self>,
  sourceContext = context,
): InactiveSlotOverlay => {
  const source: unknown[] = [];
  const children = new Map<BlueprintChildEntry, InactiveSlotOverlay>();
  const sources = new Map<BlueprintChildEntry, Self>();
  const entries = getSlotEntries(node, previous);
  let position = 0;
  while (position < entries.length) {
    const name = entries[position].name;
    let value: unknown;
    let retained = false;
    do {
      const entry = entries[position++];
      const child = getSlotSource(node, entry, previous);
      if (!child.instance) continue;
      const result = resolve(
        child.instance,
        true,
        true,
        child.overlay,
        node.structure?.[entry.name] === child.instance ? context : undefined,
        sourceContext,
      );
      if (!result.hasSource) continue;
      const candidates = getItemEntries(node.blueprintNode, source.length);
      const target = candidates.find(
        (candidate) => candidate.node === entry.node,
      ) ?? { ...entry, name: String(source.length) };
      sources.set(target, child.instance);
      children.set(
        target,
        materializeKeptSlotOverlay(entry.node, child.instance, result.overlay),
      );
      if (!retained || node.structure?.[name] === child.instance)
        value = readSlotSourceTree(entry.node, child.instance, result.overlay);
      retained = true;
    } while (position < entries.length && entries[position].name === name);
    if (retained) source.push(value);
  }
  if (sourceContext && source.length)
    (sourceContext.compactedSlotSources ??= new Map()).set(node, {
      itemCount: source.length,
      sources,
      overlays: children,
    });
  return {
    replace: true,
    source: source.length ? Object.freeze(source) : undefined,
    extras: undefined,
    itemCount: source.length,
    packedArrayInput: true,
    children,
  };
};
