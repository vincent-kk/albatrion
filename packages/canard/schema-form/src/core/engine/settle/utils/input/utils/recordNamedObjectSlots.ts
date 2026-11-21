import type { BlueprintChildEntry } from '../../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { getDeclaredChildNames } from '../../declarations/getDeclaredChildNames';
import { createSlotValueOverlay } from '../../slots/createSlotValueOverlay';
import { getSlotBinding } from '../../slots/getSlotBinding';
import { getSlotSource } from '../../slots/getSlotSource';

/**
 * Select sources for named object bindings that may remain absent through compute.
 * @param host - Live object receiving the named whole write
 * @param input - Interpreted branch input already delivered to the host channels
 * @param context - Settlement owning the host's retained source decisions
 * @returns Nothing; omitted inactive bindings retain their previous decision
 */
export const recordNamedObjectSlots = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  input: Readonly<Record<string, unknown>>,
  context: SettlementContext<Self>,
): void => {
  const retained = context.retainedSources?.get(host);
  if (!retained) return;
  const declared = getDeclaredChildNames(host.blueprintNode);
  const entries = host.blueprintNode.childEntries;
  for (const name of Object.keys(input)) {
    if (!declared.has(name) || host.childrenByName?.[name]) continue;
    const value = input[name];
    if (value === undefined) continue;
    const request = entries.find((entry) => entry.name === name);
    if (!request || request.node.kind === 'virtual') continue;
    const entry = getSlotBinding(host, request);
    const prior = getSlotSource(host, entry);
    const { overlay } = createSlotValueOverlay(
      entry.node,
      value,
      prior.instance,
      retained.namedChildren?.get(entry) ?? prior.overlay,
      true,
    );
    const named: Map<BlueprintChildEntry, InactiveSlotOverlay> =
      (retained.namedChildren ??= new Map());
    named.set(entry, overlay);
  }
};
