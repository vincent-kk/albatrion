import { getItemEntries } from '../../../../blueprint';
import type { BlueprintChildEntry } from '../../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { createSlotValueOverlay } from '../createSlotValueOverlay';
import { getSlotEntries } from '../getSlotEntries';
import { getSlotSource } from '../getSlotSource';
import { readSlotRawTree } from '../readSlotRawTree';

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
  let retainedName: string | undefined;
  for (const entry of getSlotEntries(node, previous)) {
    if (entry.name === retainedName) continue;
    const child = getSlotSource(node, entry, previous);
    if (!child.source) continue;
    const result = resolve(child.source, true, true, child.overlay, context);
    if (!result.hasSource) continue;
    const value = readSlotRawTree(entry.node, child.source, result.overlay);
    if (value === undefined) continue;
    const target =
      getItemEntries(node.blueprintNode, raw.length).find(
        (candidate) => candidate.node === entry.node,
      ) ?? getItemEntries(node.blueprintNode, raw.length)[0];
    if (!target) continue;
    const patch = createSlotValueOverlay(
      target.node,
      value,
      undefined,
      undefined,
      true,
      false,
      undefined,
      true,
    ).overlay;
    children.set(target, patch);
    raw.push(value);
    retainedName = entry.name;
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
