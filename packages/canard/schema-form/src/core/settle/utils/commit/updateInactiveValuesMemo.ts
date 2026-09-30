import { escapeSegment } from '@winglet/json/pointer';
import type { BlueprintNode } from '../../../blueprint';
import { find } from '../../../navigation';
import type { SchemaNodeRecord } from '../../../record';
import { isTypeMismatch } from './isTypeMismatch';
import { pickLatentChildren } from '../latent/pickLatentChildren';
import { EMPTY_VALUES } from '../detached/emptyDetachedReads';

/** Compare two occurrence positions without converting them to path strings. */
const compareOrder = (left: readonly number[], right: readonly number[]): number => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index] - right[index];
    if (difference) return difference;
  }
  return left.length - right.length;
};

/**
 * Publish only changed latent subtrees while retaining unchanged item objects.
 * @param root - Current shape and tree-local latent classification and memo
 * @returns Nothing; inactiveValuesMemo is updated at this commit boundary
 */
export const updateInactiveValuesMemo = <Self extends SchemaNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  if (!runtime.latentRawDirty && runtime.inactiveValuesMemo.has('')) return;
  const metadata = runtime.latentRawMetadata;
  const entries = runtime.inactiveValueEntries ?? new Map();
  const changedPaths: string[] = [];
  const candidates = new Map<string, { path: string; value: unknown;
    order: readonly number[]; explicit: boolean }>();
  const ancestors = new Set<object>();
  const hiddenHosts = new Set<string>();
  for (const key of runtime.latentRaw.keys()) {
    const info = metadata?.get(key);
    if (info?.blueprintNode.strategy === 'branch' && find(root, info.path))
      hiddenHosts.add(info.path);
  }
  const collect = (key: string, path: string, value: unknown,
    template: BlueprintNode, order: readonly number[]): void => {
    let ancestor = path;
    while (ancestor) {
      if (hiddenHosts.has(ancestor)) return;
      ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
    }
    if (find(root, path)) return;
    if (template.strategy === 'terminal' ||
      isTypeMismatch(value, template.schemaType, template.nullable)) {
      candidates.set(key, { path, value, order,
        explicit: runtime.latentRaw.has(key) });
      return;
    }
    if (value === null || typeof value !== 'object' ||
      Array.isArray(value) || ancestors.has(value)) return;
    ancestors.add(value);
    for (const index of pickLatentChildren(template, path, value,
      runtime.latentRaw)) {
      const child = template.childEntries[index];
      const childPath = `${path}/${escapeSegment(child.name)}`;
      const childKey = JSON.stringify([childPath, child.node.kind]);
      collect(childKey, childPath, runtime.latentRaw.has(childKey) ?
        runtime.latentRaw.get(childKey) : Reflect.get(value, child.name),
      child.node, [...order, index]);
    }
    ancestors.delete(value);
  };
  for (const [key, value] of runtime.latentRaw) {
    const info = metadata?.get(key);
    if (info) collect(key, info.path, value, info.blueprintNode, info.order);
  }
  const chosen = new Map<string, string>();
  for (const [key, candidate] of candidates) {
    const held = candidates.get(chosen.get(candidate.path) ?? '');
    if (!held || (candidate.explicit && !held.explicit) ||
      (candidate.explicit === held.explicit &&
        compareOrder(candidate.order, held.order) < 0))
      chosen.set(candidate.path, key);
  }
  for (const [key, candidate] of candidates)
    if (chosen.get(candidate.path) !== key) candidates.delete(key);
  for (const [key, candidate] of candidates) {
    const previous = entries.get(key);
    if (previous && Object.is(previous.value, candidate.value) &&
      compareOrder(previous.order, candidate.order) === 0) continue;
    entries.set(key, {
      value: candidate.value, order: candidate.order,
      entry: previous && Object.is(previous.value, candidate.value) ? previous.entry :
        Object.freeze({ path: candidate.path, value: candidate.value }),
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
  const ordered = [...entries.values()].sort((left, right) =>
    compareOrder(left.order, right.order) ||
    (left.entry.path < right.entry.path ? -1 : left.entry.path > right.entry.path ? 1 : 0));
  const affected = new Set<string>(['']);
  for (const path of changedPaths) {
    let ancestor = path;
    while (ancestor) {
      affected.add(ancestor);
      ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
    }
  }
  for (const host of affected) {
    const next = ordered.filter(({ entry }) => !host || entry.path === host ||
      entry.path.startsWith(`${host}/`)).map(({ entry }) => entry);
    const previous = runtime.inactiveValuesMemo.get(host);
    if (previous && previous.length === next.length &&
      previous.every((entry, index) => entry === next[index])) continue;
    if (next.length) runtime.inactiveValuesMemo.set(host, Object.freeze(next));
    else if (!host) runtime.inactiveValuesMemo.set('', EMPTY_VALUES);
    else runtime.inactiveValuesMemo.delete(host);
  }
};
