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
 * Materialize the source tree of a retained occurrence only when a reader needs it.
 * @param template - Candidate's fixed blueprint, including input-only candidates
 * @param instance - Detached instance owning unchanged source channels
 * @param overlay - Interpreted replacement or descendant patches
 * @returns Source tree with every array position, or undefined for an empty object
 */
export const readSlotSourceTree = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  instance: Optional<Self>,
  overlay?: InactiveSlotOverlay,
): unknown => {
  const source =
    overlay && hasOwnProperty(overlay, 'source')
      ? overlay.source
      : overlay?.replace
        ? undefined
        : instance?.source;
  if (source !== undefined || template.strategy === 'terminal') return source;
  const extras =
    overlay && hasOwnProperty(overlay, 'extras')
      ? overlay.extras
      : overlay?.replace
        ? undefined
        : instance?.extras;
  if (template.kind === 'array') {
    const count =
      overlay?.itemCount ?? (overlay?.replace ? 0 : (instance?.itemCount ?? 0));
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
      const active = !overlay?.replace && instance?.structure?.[String(index)];
      if (active) {
        const entry = entries.find(
          (entry) => entry.node === active.blueprintNode,
        );
        const patch = entry
          ? getSlotSource(instance, entry, overlay).overlay
          : undefined;
        item = readSlotSourceTree(active.blueprintNode, active, patch);
        value.push(item);
        continue;
      }
      for (const entry of entries) {
        const child = getSlotSource(instance, entry, overlay);
        item = readSlotSourceTree(entry.node, child.instance, child.overlay);
        if (item !== undefined) break;
      }
      value.push(item);
    }
    return value;
  }
  const value: Dictionary<unknown> = isPlain(extras) ? { ...extras } : {};
  let found = Object.keys(value).length > 0;
  for (const entry of getSlotEntries(instance, overlay, template)) {
    if (hasOwnProperty(value, entry.name)) continue;
    const child = getSlotSource(instance, entry, overlay);
    const active = !overlay?.replace && instance?.structure?.[entry.name];
    let source: unknown;
    if (active && instance) {
      const binding =
        getRetainedChildEntry(instance, active.name, active.blueprintNode) ??
        entry;
      source = readSlotSourceTree(
        active.blueprintNode,
        active,
        getSlotSource(instance, binding, overlay).overlay,
      );
    } else source = readSlotSourceTree(entry.node, child.instance, child.overlay);
    if (source === undefined) continue;
    Object.defineProperty(value, entry.name, {
      value: source,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    found = true;
  }
  return found ? value : undefined;
};
