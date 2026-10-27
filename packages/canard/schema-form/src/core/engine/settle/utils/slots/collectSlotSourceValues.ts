import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import { getItemEntries } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { InactiveSlotCandidate } from '../../types/slots';
import { isMisfit } from '../commit/isMisfit';
import { getSlotEntries } from './getSlotEntries';
import { getSlotEntryPosition } from './getSlotEntryPosition';
import { getSlotSource } from './getSlotSource';
import { readSlotRawTree } from './readSlotRawTree';
import { readSlotValueEntry } from './readSlotValueEntry';

/**
 * Enumerate one absent source with the latent path's terminal and packed-array rules.
 * @param template - Fixed candidate shape, also available for input-only sources
 * @param source - Detached source instance, if this binding was ever active
 * @param overlay - Host-owned patch over its source channels
 * @param path - Current publication address rather than the source's frozen path
 * @param order - Document position of this candidate
 * @param live - Current-shape counterpart suppressing raw at occupied addresses
 * @param values - Reader-local result list filled in place
 * @param patchOnly - Whether an enclosing packed array retains only explicit new keys
 * @returns Nothing; sources are materialized only by the public read path
 */
export const collectSlotSourceValues = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  source: Self | undefined,
  overlay: InactiveSlotOverlay | undefined,
  path: string,
  order: readonly number[],
  live: Self | undefined,
  values: InactiveSlotCandidate[],
  patchOnly = false,
): void => {
  if ((!source && !overlay) || template.kind === 'virtual') return;
  const ownsRaw = overlay !== undefined && hasOwnProperty(overlay, 'raw');
  const raw = ownsRaw
    ? overlay?.raw
    : overlay?.replace
      ? undefined
      : source?.raw;
  const array = template.kind === 'array' && template.strategy === 'branch';
  const composed =
    array && source !== undefined && !ownsRaw && !overlay?.replace;
  let value: unknown;
  if (!patchOnly || ownsRaw) {
    if (template.strategy === 'terminal') value = raw;
    else if (
      raw !== undefined &&
      ((array && isArray(raw)) ||
        isMisfit(raw, template.schemaType, template.nullable))
    )
      value = raw;
    else if (composed) {
      const materialized = readSlotRawTree(
        template,
        source,
        source.retainedSourceOverlay,
      );
      value = isArray(materialized)
        ? Object.freeze(materialized)
        : materialized;
    }
  }
  if (value !== undefined && !live)
    values.push({
      order,
      entry: readSlotValueEntry(source, overlay, path, value, composed),
    });
  if (template.strategy === 'terminal') return;
  const packed = array && composed && !patchOnly;
  for (const entry of getSlotEntries(source, overlay, template)) {
    const explicit = overlay?.children?.has(entry) === true;
    const candidate =
      array &&
      (entry.node.hasCandidateDescendants ||
        getItemEntries(template, Number(entry.name)).length > 1);
    if (patchOnly && !explicit) continue;
    if (packed && !candidate && !explicit) continue;
    const child = getSlotSource(source, entry, overlay);
    collectSlotSourceValues(
      entry.node,
      child.source,
      child.overlay,
      path + '/' + escapeSegment(entry.name),
      [...order, getSlotEntryPosition(template, entry)],
      live?.structure?.[entry.name],
      values,
      patchOnly || (packed && !candidate),
    );
  }
};
