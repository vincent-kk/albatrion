import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary, Optional } from '@aileron/declare';

import { getItemEntries } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { isPlain } from '../input/isPlain';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';

/**
 * Materialize the raw tree of a retained occurrence only when a reader needs it.
 * @param template - Candidate's fixed blueprint, including input-only candidates
 * @param source - Detached instance owning unchanged source channels
 * @param overlay - Interpreted replacement or descendant patches
 * @returns Raw tree with every array position, or undefined for an empty object
 */
export const readSlotRawTree = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  source: Optional<Self>,
  overlay?: InactiveSlotOverlay,
): unknown => {
  const raw =
    overlay && hasOwnProperty(overlay, 'raw')
      ? overlay.raw
      : overlay?.replace
        ? undefined
        : source?.raw;
  if (raw !== undefined || template.strategy === 'terminal') return raw;
  const extras =
    overlay && hasOwnProperty(overlay, 'undeclaredValues')
      ? overlay.undeclaredValues
      : overlay?.replace
        ? undefined
        : source?.undeclaredValues;
  if (template.kind === 'array') {
    const count =
      overlay?.itemCount ?? (overlay?.replace ? 0 : (source?.itemCount ?? 0));
    const value: unknown[] = [];
    let declaredCount = 0;
    for (let index = 0; index < count; index++) {
      const entries = getItemEntries(template, index);
      if (!entries.length) {
        value.push(isArray(extras) ? extras[index - declaredCount] : undefined);
        continue;
      }
      declaredCount++;
      let item: unknown;
      const active = !overlay?.replace && source?.structure?.[String(index)];
      if (active) {
        const entry = entries.find(
          (entry) => entry.node === active.blueprintNode,
        );
        const patch = entry
          ? getSlotSource(source, entry, overlay).overlay
          : undefined;
        item = readSlotRawTree(active.blueprintNode, active, patch);
        value.push(item);
        continue;
      }
      for (const entry of entries) {
        const child = getSlotSource(source, entry, overlay);
        item = readSlotRawTree(entry.node, child.source, child.overlay);
        if (item !== undefined) break;
      }
      value.push(item);
    }
    return value;
  }
  const value: Dictionary<unknown> = isPlain(extras) ? { ...extras } : {};
  let found = Object.keys(value).length > 0;
  for (const entry of getSlotEntries(source, overlay, template)) {
    if (hasOwnProperty(value, entry.name)) continue;
    const child = getSlotSource(source, entry, overlay);
    const active = !overlay?.replace && source?.structure?.[entry.name];
    let raw: unknown;
    if (active && source) {
      const binding =
        getRetainedChildEntry(source, active.name, active.blueprintNode) ??
        entry;
      raw = readSlotRawTree(
        active.blueprintNode,
        active,
        getSlotSource(source, binding, overlay).overlay,
      );
    } else raw = readSlotRawTree(entry.node, child.source, child.overlay);
    if (raw === undefined) continue;
    Object.defineProperty(value, entry.name, {
      value: raw,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    found = true;
  }
  return found ? value : undefined;
};
