import { getItemEntries } from '../../../../blueprint';
import type { BlueprintChildEntry } from '../../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { getSlotEntries } from '../getSlotEntries';
import { getSlotSource } from '../getSlotSource';
import { readSlotRawTree } from '../readSlotRawTree';
import { materializeKeptSlotOverlay } from './createClearedArrayOverlay/materializeKeptSlotOverlay';

/** Recursive exit resolver supplied by the owner to keep dependencies acyclic. */
type ResolveExit<Self extends FieldNodeRecord<Self>> = (
  node: Self,
  inherited: boolean,
  applyPolicy: boolean,
  previous?: InactiveSlotOverlay,
  context?: SettlementContext<Self>,
) => {
  readonly overlay: InactiveSlotOverlay | undefined;
  readonly hasSource: boolean;
};

/**
 * Pack only items whose recursively resolved exit preserves a source.
 * @param node - Clearing array whose old instances and addresses remain frozen
 * @param previous - Existing input patches covering the departing array
 * @param context - Last-live exit inputs, absent for already inactive sources
 * @param resolve - Owner's ordinary object/terminal exit-policy traversal
 * @returns A replacement with compacted raw and independently bound child patches
 */
export const createClearedArrayOverlay = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  previous: InactiveSlotOverlay | undefined,
  context: SettlementContext<Self> | undefined,
  resolve: ResolveExit<Self>,
): InactiveSlotOverlay => {
  const raw: unknown[] = [];
  const children = new Map<BlueprintChildEntry, InactiveSlotOverlay>();
  const entries = getSlotEntries(node, previous);
  let position = 0;
  while (position < entries.length) {
    const name = entries[position].name;
    let value: unknown;
    let retained = false;
    do {
      const entry = entries[position++];
      const child = getSlotSource(node, entry, previous);
      if (!child.source) continue;
      const result = resolve(child.source, true, true, child.overlay, context);
      if (!result.hasSource) continue;
      const candidates = getItemEntries(node.blueprintNode, raw.length);
      const target =
        candidates.find((candidate) => candidate.node === entry.node) ??
        candidates[0];
      if (!target) continue;
      children.set(
        target,
        materializeKeptSlotOverlay(entry.node, child.source, result.overlay),
      );
      if (!retained || node.structure?.[name] === child.source)
        value = readSlotRawTree(entry.node, child.source, result.overlay);
      retained = true;
    } while (position < entries.length && entries[position].name === name);
    if (retained) raw.push(value);
  }
  return {
    replace: true,
    raw: raw.length ? Object.freeze(raw) : undefined,
    undeclaredValues: undefined,
    itemCount: raw.length,
    packedArrayInput: true,
    children,
  };
};
