import { isArray } from '@winglet/common-utils/filter';
import { unescapeSegment } from '@winglet/json/pointer';
import type { SchemaNodeRecord } from '../../../record';
import { getLoadValue } from './getLoadValue';
import { setLoadValue } from './setLoadValue';
import { sameValue } from '../compute/sameValue';

/** Only canonical decimal segments address array slots without named properties. */
const ARRAY_INDEX = /^(0|[1-9]\d*)$/;

/**
 * Align resized arrays in one snapshot draft after their final shapes are known.
 * @param hosts - Live resized arrays in settlement registration order
 * @returns Nothing; existing slots and unrelated references are retained
 */
export const alignArraySnapshotSlots = <Self extends SchemaNodeRecord<Self>>(
  hosts: readonly Self[],
): void => {
  if (!hosts.length) return;
  const runtime = hosts[0].runtime;
  let draft = runtime.loadSnapshot;
  const copies = new WeakMap<object, Map<string, object>>();
  const draftContainers = new WeakSet<object>();
  const draftCopy = (source: unknown, path: string): object => {
    if (source !== null && typeof source === 'object') {
      if (draftContainers.has(source)) return source;
      let byPath = copies.get(source);
      const existing = byPath?.get(path);
      if (existing) return existing;
      const clone = isArray(source) ? [...source] : { ...source };
      if (!byPath) {
        byPath = new Map();
        copies.set(source, byPath);
      }
      byPath.set(path, clone);
      draftContainers.add(clone);
      return clone;
    }
    const clone = {};
    draftContainers.add(clone);
    return clone;
  };
  for (const host of hosts) {
    const previous = getLoadValue(draft, host.path);
    if (!isArray(previous) && host.itemCount === 0) continue;
    const slots = isArray(previous) ? previous.slice(0, host.itemCount) : [];
    while (slots.length < host.itemCount) slots.push(undefined);
    if (sameValue(previous, slots)) continue;
    draftContainers.add(slots);
    if (!host.path) {
      draft = slots;
      continue;
    }
    const encoded = host.path.slice(1).split('/');
    const segments = encoded.map(unescapeSegment);
    let probe: unknown = draft;
    let byName = false;
    for (const segment of segments) {
      if (isArray(probe) && !ARRAY_INDEX.test(segment)) {
        byName = true;
        break;
      }
      probe = probe !== null && typeof probe === 'object'
        ? Reflect.get(probe, segment) : undefined;
    }
    if (byName) {
      draft = setLoadValue(draft, host.path, slots);
      continue;
    }
    let parent = draftCopy(draft, '');
    draft = parent;
    let parentPath = '';
    for (let index = 0; index < segments.length - 1; index++) {
      const segment = segments[index];
      parentPath += `/${encoded[index]}`;
      const child = draftCopy(Reflect.get(parent, segment), parentPath);
      Reflect.set(parent, segment, child);
      parent = child;
    }
    Reflect.set(parent, segments[segments.length - 1], slots);
  }
  runtime.loadSnapshot = draft;
};
