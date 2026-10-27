import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import { getItemEntries } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type {
  ArrayArrangePlan,
  FieldNodeRecord,
  InactiveSlotOverlay,
} from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { DetachedWriteAddress } from '../latentStore/DetachedWriteAddress';
import { HostLatent } from '../latentStore/HostLatent';
import { getLatentOrder } from '../latentStore/getLatentOrder';
import { writeLatentRaw } from '../transition/writeLatentRaw';
import { getSlotEntries } from './getSlotEntries';
import { getSlotEntryPosition } from './getSlotEntryPosition';
import { getSlotSource } from './getSlotSource';
import { markSlotChange } from './markSlotChange';
import { readSlotRawTree } from './readSlotRawTree';

/**
 * Convert retained sources only when a structural move cannot transfer exact bindings.
 * @param host - Array before source paths or live records change
 * @param plan - Surviving source positions and newly inserted inputs
 * @param context - Structural replay and rollback work
 * @returns Whether this operation converted any retained sources for structural replay
 */
export const serializeArraySlotSources = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  plan: Extract<ArrayArrangePlan, { kind: 'slots' }>,
  context: SettlementContext<Self>,
): boolean => {
  if (
    !host.inactiveSlots?.size &&
    !host.inactiveSlotOverlays?.size &&
    !host.inactiveSlotChildren?.size
  )
    return false;
  const incompatible = plan.slots.some((slot, index) => {
    if (!('from' in slot) || slot.from === index) return false;
    const candidates = getItemEntries(host.blueprintNode, index);
    return getItemEntries(host.blueprintNode, slot.from).some(
      (entry) => !candidates.some((target) => target.node === entry.node),
    );
  });
  if (!incompatible) return false;
  const capture = (
    template: BlueprintNode,
    source: Self | undefined,
    overlay: InactiveSlotOverlay | undefined,
    path: string,
    order: readonly number[],
  ): void => {
    if ((!source && !overlay) || template.kind === 'virtual') return;
    const raw =
      overlay && hasOwnProperty(overlay, 'raw')
        ? overlay.raw
        : overlay?.replace
          ? undefined
          : source?.raw;
    const extras =
      overlay && hasOwnProperty(overlay, 'undeclaredValues')
        ? overlay.undeclaredValues
        : overlay?.replace
          ? undefined
          : source?.undeclaredValues;
    const entries = getSlotEntries(source, overlay, template);
    const packed =
      template.kind === 'array' &&
      template.strategy === 'branch' &&
      raw === undefined &&
      source !== undefined &&
      !overlay?.replace &&
      !(overlay && hasOwnProperty(overlay, 'raw'));
    for (const entry of entries) {
      if (
        packed &&
        !entry.node.hasCandidateDescendants &&
        getItemEntries(template, Number(entry.name)).length < 2 &&
        !overlay?.children?.has(entry)
      )
        continue;
      const child = getSlotSource(source, entry, overlay);
      capture(
        entry.node,
        child.source,
        child.overlay,
        path + '/' + escapeSegment(entry.name),
        [...order, getSlotEntryPosition(template, entry)],
      );
    }
    const materialized = packed
      ? readSlotRawTree(template, source, overlay)
      : undefined;
    const value =
      template.strategy === 'terminal'
        ? raw
        : packed
          ? new HostLatent(
              Object.freeze(isArray(materialized) ? materialized : []),
              undefined,
              entries
                .filter(
                  (entry) =>
                    entry.node.hasCandidateDescendants ||
                    getItemEntries(template, Number(entry.name)).length > 1,
                )
                .map((entry) => entry.name),
            )
          : raw === undefined && extras === undefined
            ? undefined
            : new HostLatent(raw, extras);
    const key = JSON.stringify([path, getBlueprintNodeIdentity(template)]);
    writeLatentRaw(
      context,
      key,
      value !== undefined && !overlay?.packedArrayInput,
      value,
      template,
      order,
    );
    const metadata = host.runtime.latentRawMetadata?.get(key);
    if (metadata && source?.retainedExitPolicy !== undefined) {
      const current = {
        ...metadata,
        exitLayers: [
          { layer: 'node' as const, clear: source.retainedExitPolicy },
        ],
      };
      DetachedWriteAddress.transfer(metadata, current, host.runtime);
      host.runtime.latentRawMetadata?.set(key, current);
    }
    const classified = host.runtime.latentRawMetadata?.get(key);
    if (source && classified)
      DetachedWriteAddress.retain(source, classified, host.runtime);
  };
  const convert = (owner: Self): void => {
    const entries = getSlotEntries(owner).filter(
      (entry) =>
        owner.inactiveSlots?.has(entry) ||
        owner.inactiveSlotOverlays?.has(entry),
    );
    for (const entry of entries) {
      capture(
        entry.node,
        owner.inactiveSlots?.get(entry),
        owner.inactiveSlotOverlays?.get(entry),
        owner.path + '/' + escapeSegment(entry.name),
        getLatentOrder(owner, entry.name, entry.node),
      );
      markSlotChange(owner, entry, undefined, context);
      owner.inactiveSlots?.delete(entry);
      owner.inactiveSlotOverlays?.delete(entry);
    }
    for (const child of owner.inactiveSlotChildren?.values() ?? [])
      if (owner.structure?.[child.name] === child) convert(child);
  };
  convert(host);
  return true;
};
