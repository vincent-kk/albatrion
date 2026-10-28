import { getItemEntries } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { createSlotValueOverlay } from './createSlotValueOverlay';
import { getSlotBinding } from './getSlotBinding';
import { getSlotPathEntry } from './getSlotPathEntry';
import { getSlotPathNames } from './getSlotPathNames';
import { getSlotSource } from './getSlotSource';
import { markSlotChange } from './markSlotChange';

/**
 * Write an absent address through its nearest live slot owner.
 * @param root - Current tree, whose retained sources remain immutable
 * @param path - Current write address
 * @param target - Exact kind selected for the addressed occurrence
 * @param input - Caller input interpreted only at the target
 * @param whole - Whether the target's missing descendants are replaced
 * @param context - Optional automatic-write rollback scope
 * @param automatic - Whether projected child writes preserve wrong-kind ancestor raw
 * @param preserveCandidates - Structural replay keeps other kinds at the same address
 * @returns Whether a terminal descendant has a projected value
 */
export const writeSlotPath = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
  target: BlueprintNode,
  input: unknown,
  whole: boolean,
  context?: SettlementContext<Self>,
  automatic = false,
  preserveCandidates = false,
): boolean => {
  const names = getSlotPathNames(root.runtime, path);
  if (names === undefined) return false;
  let host = root;
  for (let depth = 0; depth < names.length; depth++) {
    const template = host.blueprintNode;
    const name = names[depth];
    const entries =
      template.kind === 'array'
        ? getItemEntries(template, Number(name))
        : template.childEntries;
    const selected = depth === names.length - 1 ? target : undefined;
    const requested = getSlotPathEntry(
      template,
      host,
      undefined,
      name,
      selected,
    );
    const entry = requested && getSlotBinding(host, requested);
    if (!entry) return false;
    const live = host.structure?.[name];
    if (
      depth < names.length - 1 &&
      live?.blueprintNode === entry.node &&
      !live.detached
    ) {
      host = live;
      continue;
    }
    const source = host.inactiveSlots?.get(entry);
    const previous = host.inactiveSlotOverlays?.get(entry);
    let wrote = false;
    const patch = (
      template: BlueprintNode,
      source: Self | undefined,
      previous: InactiveSlotOverlay | undefined,
      index: number,
    ): InactiveSlotOverlay => {
      if (index === names.length) {
        const result = createSlotValueOverlay(
          template,
          input,
          source,
          previous,
          whole,
          automatic,
        );
        wrote = result.wrote;
        return result.overlay;
      }
      const name = names[index];
      const entries =
        template.kind === 'array'
          ? getItemEntries(template, Number(name))
          : template.childEntries;
      const selected = index === names.length - 1 ? target : undefined;
      const requested = getSlotPathEntry(
        template,
        source,
        previous,
        name,
        selected,
      );
      const binding = requested && getSlotBinding(source, requested, previous);
      if (!binding) return previous ?? {};
      const prior = getSlotSource(source, binding, previous);
      const children = new Map(previous?.children);
      children.set(
        binding,
        patch(binding.node, prior.source, prior.overlay, index + 1),
      );
      for (const other of entries) {
        if (
          preserveCandidates ||
          other.name !== name ||
          getBlueprintNodeIdentity(other.node) ===
            getBlueprintNodeIdentity(binding.node) ||
          source?.structure?.[name]?.blueprintNode === other.node
        )
          continue;
        const prior = getSlotSource(source, other, previous);
        if (prior.source || prior.overlay)
          children.set(other, { replace: true });
      }
      return { ...previous, children };
    };
    markSlotChange(host, entry, undefined, context);
    (host.inactiveSlotOverlays ??= new Map()).set(
      entry,
      patch(entry.node, source, previous, depth + 1),
    );
    for (const other of entries) {
      if (
        preserveCandidates ||
        other.name !== name ||
        getBlueprintNodeIdentity(other.node) ===
          getBlueprintNodeIdentity(entry.node)
      )
        continue;
      if (
        !host.inactiveSlots?.has(other) &&
        !host.inactiveSlotOverlays?.has(other)
      )
        continue;
      markSlotChange(host, other, undefined, context);
      host.inactiveSlots?.delete(other);
      host.inactiveSlotOverlays?.delete(other);
    }
    return wrote;
  }
  return false;
};
