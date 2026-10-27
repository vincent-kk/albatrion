import { unescapeSegment } from '@winglet/json/pointer';

import { getItemEntries } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { createSlotValueOverlay } from './createSlotValueOverlay';
import { getSlotSource } from './getSlotSource';
import { markSlotChange } from './markSlotChange';

/**
 * Write an absent address through its nearest live slot owner.
 * @param root - Current tree, whose retained sources remain immutable
 * @param path - Current write address, independent of an old reference's path
 * @param target - Exact kind selected for the addressed occurrence
 * @param input - Caller input interpreted only at the target
 * @param whole - Whether the target's missing descendants are replaced
 * @param context - Optional automatic-write rollback scope
 * @param lineage - Old reference's blueprint chain, when its ancestors disambiguate kinds
 * @param automatic - Whether projected child writes preserve wrong-kind ancestor raw
 * @returns Whether a terminal descendant has a projected value
 */
export const writeSlotPath = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
  target: BlueprintNode,
  input: unknown,
  whole: boolean,
  context?: SettlementContext<Self>,
  lineage?: readonly BlueprintNode[],
  automatic = false,
): boolean => {
  const names = path.split('/').slice(1).map(unescapeSegment);
  let host = root;
  for (let depth = 0; depth < names.length; depth++) {
    const template = host.blueprintNode;
    const name = names[depth];
    const entries =
      template.kind === 'array'
        ? getItemEntries(template, Number(name))
        : template.childEntries;
    const selected = depth === names.length - 1 ? target : lineage?.[depth + 1];
    const entry = entries.find(
      (entry) =>
        entry.name === name &&
        (selected === undefined || entry.node === selected),
    );
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
      const selected =
        index === names.length - 1 ? target : lineage?.[index + 1];
      const binding = entries.find(
        (entry) =>
          entry.name === name &&
          (selected === undefined || entry.node === selected),
      );
      if (!binding) return previous ?? {};
      const prior = getSlotSource(source, binding, previous);
      const children = new Map(previous?.children);
      children.set(
        binding,
        patch(binding.node, prior.source, prior.overlay, index + 1),
      );
      for (const other of entries) {
        if (other.name !== name || other.node === binding.node) continue;
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
      if (other.name !== name || other.node === entry.node) continue;
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
