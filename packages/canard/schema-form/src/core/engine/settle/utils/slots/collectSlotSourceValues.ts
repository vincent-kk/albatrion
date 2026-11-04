import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { getItemEntries } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { InactiveSlotCandidate } from '../../types/slots';
import { isMisfit } from '../commit/isMisfit';
import { getSlotEntries } from './getSlotEntries';
import { getSlotEntryPosition } from './getSlotEntryPosition';
import { getSlotSource } from './getSlotSource';
import { readSlotSourceTree } from './readSlotSourceTree';
import { readSlotValueEntry } from './readSlotValueEntry';

/**
 * Enumerate one absent source with the latent path's terminal and packed-array rules.
 * @param template - Fixed candidate shape, also available for input-only sources
 * @param instance - Detached source instance, if this binding was ever active
 * @param overlay - Host-owned patch over its source channels
 * @param path - Current publication address rather than the source's frozen path
 * @param order - Document position of this candidate
 * @param live - Current-shape counterpart suppressing source at occupied addresses
 * @param values - Reader-local result list filled in place
 * @param patchOnly - Whether an enclosing packed array retains only explicit new keys
 * @returns Nothing; sources are materialized only by the public read path
 */
export const collectSlotSourceValues = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  instance: Optional<Self>,
  overlay: Optional<InactiveSlotOverlay>,
  path: string,
  order: readonly number[],
  live: Optional<Self>,
  values: InactiveSlotCandidate[],
  patchOnly = false,
): void => {
  if ((!instance && !overlay) || template.kind === 'virtual') return;
  const ownsSource = overlay !== undefined && hasOwnProperty(overlay, 'source');
  const source = ownsSource
    ? overlay?.source
    : overlay?.replace
      ? undefined
      : instance?.source;
  const array = template.kind === 'array' && template.strategy === 'branch';
  const composed =
    array && instance !== undefined && !ownsSource && !overlay?.replace;
  let value: unknown;
  if (!patchOnly || ownsSource) {
    if (template.strategy === 'terminal') value = source;
    else if (
      source !== undefined &&
      ((array && isArray(source)) ||
        isMisfit(source, template.schemaType, template.nullable))
    )
      value = source;
    else if (composed) {
      const materialized = readSlotSourceTree(
        template,
        instance,
        instance.retainedSourceOverlay,
      );
      value = isArray(materialized)
        ? Object.freeze(materialized)
        : materialized;
    }
  }
  if (value !== undefined && !live && !overlay?.packedArrayInput)
    values.push({
      order,
      entry: readSlotValueEntry(instance, overlay, path, value, composed),
    });
  if (template.strategy === 'terminal') return;
  const packed = array && composed && !patchOnly;
  for (const entry of getSlotEntries(instance, overlay, template)) {
    const explicit =
      overlay?.children?.has(entry) === true &&
      overlay.children.get(entry) !==
        instance?.retainedSourceOverlay?.children?.get(entry);
    const candidate =
      array &&
      (entry.node.hasCandidateDescendants ||
        getItemEntries(template, Number(entry.name)).length > 1);
    if (patchOnly && !explicit) continue;
    if (packed && !candidate && !explicit) continue;
    const child = getSlotSource(instance, entry, overlay);
    collectSlotSourceValues(
      entry.node,
      child.instance,
      child.overlay,
      appendSegment(path, entry.name),
      [...order, getSlotEntryPosition(template, entry)],
      live?.structure?.[entry.name],
      values,
      patchOnly || (packed && !candidate),
    );
  }
};
