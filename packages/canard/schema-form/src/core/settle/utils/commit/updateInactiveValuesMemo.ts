import type { SchemaNodeRuntime } from '../../../record';
import { isTypeMismatch } from './isTypeMismatch';
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
 * @param runtime - Tree-local raw sources, classification, and prior memo
 * @returns Nothing; inactiveValuesMemo is updated at this commit boundary
 */
export const updateInactiveValuesMemo = <Self>(runtime: SchemaNodeRuntime<Self>): void => {
  const metadata = runtime.latentRawMetadata;
  const entries = runtime.inactiveValueEntries ?? new Map();
  const changedPaths: string[] = [];
  for (const [key, value] of runtime.latentRaw) {
    const info = metadata?.get(key);
    const previous = entries.get(key);
    if (!info || (info.blueprintNode.strategy !== 'terminal' &&
      !isTypeMismatch(value, info.blueprintNode.schemaType,
        info.blueprintNode.nullable))) {
      if (previous) {
        entries.delete(key);
        changedPaths.push(previous.entry.path);
      }
      continue;
    }
    if (previous && Object.is(previous.value, value) &&
      compareOrder(previous.order, info.order) === 0) continue;
    entries.set(key, {
      value, order: info.order,
      entry: previous && Object.is(previous.value, value) ? previous.entry :
        Object.freeze({ path: info.path, value }),
    });
    changedPaths.push(info.path);
  }
  for (const [key, previous] of entries)
    if (!runtime.latentRaw.has(key)) {
      entries.delete(key);
      changedPaths.push(previous.entry.path);
    }
  if (metadata)
    for (const key of metadata.keys())
      if (!runtime.latentRaw.has(key)) metadata.delete(key);
  runtime.inactiveValueEntries = entries;
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
