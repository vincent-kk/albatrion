import { isArray } from '@winglet/common-utils/filter';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { find } from '../../../navigation';
import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import { EMPTY_VALUES } from '../detached/emptyDetachedReads';
import { compareInactiveOrder } from '../inactiveValues/compareInactiveOrder';
import { HostLatent } from '../latentStore/HostLatent';
import { isMisfit } from './isMisfit';

/**
 * Publish only changed latent subtrees while retaining unchanged item objects.
 * @param root - Current shape and tree-local latent classification and memo
 * @param runtime - Independent projection/source stores for fallback or shadow work
 * @param isLive - Committed presence predicate, including retained generation snapshots
 * @returns Nothing; inactiveValuesMemo is updated from the full latent source
 */
export const rebuildInactiveValuesMemo = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  runtime: FieldNodeRuntime<Self> = root.runtime,
  isLive: (path: string) => boolean = (path) => find(root, path) !== null,
): void => {
  if (!runtime.latentRawDirty && runtime.inactiveValuesMemo.has('')) return;
  const metadata = runtime.latentRawMetadata;
  const entries = (runtime.inactiveValueEntries ??= new PathKeyedMap('pair'));
  const changedPaths: string[] = [];
  const candidates = new Map<
    string,
    { path: string; value: unknown; order: readonly number[] }
  >();
  for (const [key, source] of runtime.latentRaw) {
    const info = metadata?.get(key);
    if (!info || isLive(info.path)) continue;
    const template = info.blueprintNode;
    const value =
      template.strategy === 'terminal'
        ? source
        : source instanceof HostLatent &&
            source.raw !== undefined &&
            ((template.kind === 'array' &&
              template.strategy === 'branch' &&
              isArray(source.raw)) ||
              isMisfit(source.raw, template.schemaType, template.nullable))
          ? source.raw
          : undefined;
    if (value !== undefined)
      candidates.set(key, { path: info.path, value, order: info.order });
  }
  const chosen = new Map<string, string>();
  for (const [key, candidate] of candidates) {
    const held = candidates.get(chosen.get(candidate.path) ?? '');
    if (!held || compareInactiveOrder(candidate.order, held.order) < 0)
      chosen.set(candidate.path, key);
  }
  for (const [key, candidate] of candidates)
    if (chosen.get(candidate.path) !== key) candidates.delete(key);
  for (const [key, candidate] of candidates) {
    const previous = entries.get(key);
    if (
      previous &&
      Object.is(previous.value, candidate.value) &&
      compareInactiveOrder(previous.order, candidate.order) === 0
    )
      continue;
    entries.set(key, {
      value: candidate.value,
      order: candidate.order,
      entry:
        previous && Object.is(previous.value, candidate.value)
          ? previous.entry
          : Object.freeze({ path: candidate.path, value: candidate.value }),
    });
    changedPaths.push(candidate.path);
  }
  for (const [key, previous] of entries)
    if (!candidates.has(key)) {
      entries.delete(key);
      changedPaths.push(previous.entry.path);
    }
  if (metadata)
    for (const key of metadata.keys())
      if (!runtime.latentRaw.has(key)) metadata.delete(key);
  runtime.inactiveValueEntries = entries;
  runtime.latentRawDirty = false;
  if (changedPaths.length === 0 && runtime.inactiveValuesMemo.has('')) return;
  const ordered = [...entries.values()].sort(
    (left, right) =>
      compareInactiveOrder(left.order, right.order) ||
      (left.entry.path < right.entry.path
        ? -1
        : left.entry.path > right.entry.path
          ? 1
          : 0),
  );
  const affected = new Set<string>(['']);
  for (const path of changedPaths) {
    let ancestor = path;
    while (ancestor) {
      affected.add(ancestor);
      ancestor = ancestor.slice(0, ancestor.lastIndexOf($.Separator));
    }
  }
  const entriesByHost = new Map<string, { path: string; value: unknown }[]>();
  for (const { entry } of ordered) {
    let ancestor = entry.path;
    while (true) {
      if (affected.has(ancestor)) {
        const descendants = entriesByHost.get(ancestor) ?? [];
        descendants.push(entry);
        entriesByHost.set(ancestor, descendants);
      }
      if (!ancestor) break;
      ancestor = ancestor.slice(0, ancestor.lastIndexOf($.Separator));
    }
  }
  for (const host of affected) {
    const next = entriesByHost.get(host) ?? [];
    const previous = runtime.inactiveValuesMemo.get(host);
    if (
      previous &&
      previous.length === next.length &&
      previous.every((entry, index) => entry === next[index])
    )
      continue;
    if (next.length) runtime.inactiveValuesMemo.set(host, Object.freeze(next));
    else if (!host) runtime.inactiveValuesMemo.set('', EMPTY_VALUES);
    else runtime.inactiveValuesMemo.delete(host);
  }
};
