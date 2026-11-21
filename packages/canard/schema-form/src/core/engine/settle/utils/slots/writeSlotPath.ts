import type { Optional } from '@aileron/declare';

import { getItemEntries } from '../../../blueprint';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { getChildDistribution } from '../input/getChildDistribution';
import { hasDistributedChildInput } from '../input/hasDistributedChildInput';
import { getSlotDecision } from '../source/getSlotDecision';
import { supersedeCandidateInput } from '../source/supersedeCandidateInput';
import { createSlotValueOverlay } from './createSlotValueOverlay';
import { getSlotBinding } from './getSlotBinding';
import { getSlotPathEntry } from './getSlotPathEntry';
import { getSlotPathNames } from './getSlotPathNames';
import { getSlotSource } from './getSlotSource';
import { markSlotChange } from './markSlotChange';
import { recordRetainedSlotWrite } from './utils/recordRetainedSlotWrite';

/** Annotates the lazily created `inactiveSlotOverlays`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlotOverlays = Map<BlueprintChildEntry, InactiveSlotOverlay>;

/**
 * Write an absent address through its nearest live slot owner.
 * @param root - Current tree, whose retained sources remain immutable
 * @param path - Current write address
 * @param target - Exact kind selected for the addressed occurrence
 * @param input - Caller input interpreted only at the target
 * @param isWhole - Whether the target's missing descendants are replaced
 * @param context - Optional automatic-write rollback scope
 * @param isAutomatic - Whether projected child writes preserve wrong-kind ancestor source
 * @param preserveCandidates - Structural replay keeps other kinds at the same address
 * @param selectsNamedSource - Whether this write owns the slot's retained source
 * @param writeOrder - Rank of a directly accepted latent input
 * @returns Whether a terminal descendant has a projected value
 */
export const writeSlotPath = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
  target: BlueprintNode,
  input: unknown,
  isWhole: boolean,
  context?: SettlementContext<Self>,
  isAutomatic = false,
  preserveCandidates = false,
  selectsNamedSource?: boolean,
  writeOrder?: number,
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
    const live = host.childrenByName?.[name];
    if (
      depth < names.length - 1 &&
      live?.blueprintNode === entry.node &&
      !live.isDetached
    ) {
      host = live;
      continue;
    }
    const instance = host.inactiveSlots?.get(entry);
    let previous = host.inactiveSlotOverlays?.get(entry);
    if (context && writeOrder !== undefined && depth + 1 < names.length) {
      const distribution = getChildDistribution(host, entry, context);
      if (
        distribution &&
        !distribution.shouldPreserveLatent &&
        hasDistributedChildInput(
          distribution.input,
          name,
          template.kind === 'array',
        )
      )
        previous = createSlotValueOverlay(
          entry.node,
          Reflect.get(distribution.input, name),
          instance,
          previous,
          distribution.isWhole,
        ).overlay;
    }
    let wrote = false;
    const patch = (
      template: BlueprintNode,
      instance: Optional<Self>,
      previous: Optional<InactiveSlotOverlay>,
      index: number,
    ): InactiveSlotOverlay => {
      if (index === names.length) {
        const result = createSlotValueOverlay(
          template,
          input,
          instance,
          previous,
          isWhole,
          isAutomatic,
        );
        wrote = result.hasWritten;
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
        instance,
        previous,
        name,
        selected,
      );
      const binding =
        requested && getSlotBinding(instance, requested, previous);
      if (!binding) return previous ?? {};
      const prior = getSlotSource(instance, binding, previous);
      const children = new Map(previous?.children);
      children.set(
        binding,
        patch(binding.node, prior.instance, prior.overlay, index + 1),
      );
      if (!preserveCandidates) {
        let bindingIdentity: Optional<string>;
        for (const other of entries) {
          if (
            other.name !== name ||
            other.node === binding.node ||
            instance?.childrenByName?.[name]?.blueprintNode === other.node ||
            getBlueprintNodeIdentity(other.node) ===
              (bindingIdentity ??= getBlueprintNodeIdentity(binding.node))
          )
            continue;
          const prior = getSlotSource(instance, other, previous);
          if (prior.instance || prior.overlay)
            children.set(other, { isWhole: true });
        }
      }
      return { ...previous, children };
    };
    markSlotChange(host, entry, undefined, context);
    const overlays: InactiveSlotOverlays = (host.inactiveSlotOverlays ??=
      new Map());
    overlays.set(entry, patch(entry.node, instance, previous, depth + 1));
    if (context && selectsNamedSource !== undefined)
      recordRetainedSlotWrite(host, entry, context, selectsNamedSource);
    if (context && writeOrder !== undefined) {
      const previousInput = getSlotDecision(
        host,
        entry,
        context,
        writeOrder,
      ).postPolicyInput;
      if (
        previousInput &&
        previousInput.order < writeOrder &&
        depth + 1 === names.length
      )
        supersedeCandidateInput(previousInput, true);
    }
    if (!preserveCandidates) {
      let entryIdentity: Optional<string>;
      for (const other of entries) {
        if (
          other.name !== name ||
          other.node === entry.node ||
          (!host.inactiveSlots?.has(other) &&
            !host.inactiveSlotOverlays?.has(other)) ||
          getBlueprintNodeIdentity(other.node) ===
            (entryIdentity ??= getBlueprintNodeIdentity(entry.node))
        )
          continue;
        markSlotChange(host, other, undefined, context);
        host.inactiveSlots?.delete(other);
        host.inactiveSlotOverlays?.delete(other);
        if (context && selectsNamedSource !== undefined)
          recordRetainedSlotWrite(host, other, context, selectsNamedSource);
      }
    }
    return wrote;
  }
  return false;
};
