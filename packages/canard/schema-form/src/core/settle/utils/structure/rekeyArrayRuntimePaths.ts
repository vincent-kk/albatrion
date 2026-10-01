import { isArray } from '@winglet/common-utils/filter';

import type { FormErrorRecord } from '../../../../errors';

import type { SchemaNodeRuntime } from '../../../record';
import { indexSchemaNodeWarning } from '../../../record';
import { updateCommittedRuleValue } from '../commit/updateCommittedRuleValue';

/** An old item position that either survives at another position or perishes. */
export interface ArrayPathMove {
  /** Absolute item prefix before the structural edit. */
  readonly previous: string;
  /** Surviving item's absolute destination, absent when it perishes. */
  readonly current?: string;
}

/**
 * Move every absolute-path store in two phases so chained shifts cannot collide.
 * @param runtime - Tree-owned stores and their memoized path indexes
 * @param hostPath - Array host whose position paths are being replaced
 * @param moves - Old position prefixes and their surviving destinations
 * @returns Nothing; cached subtree views are invalidated
 */
export const rekeyArrayRuntimePaths = <Self>(
  runtime: SchemaNodeRuntime<Self>, hostPath: string,
  moves: readonly ArrayPathMove[],
): void => {
  const prefix = `${hostPath}/`;
  const moveByPath = new Map(moves.map((move) => [move.previous, move.current]));
  const mapPath = (path: string): string | undefined => {
    if (!path.startsWith(prefix)) return path;
    const slash = path.indexOf('/', prefix.length);
    const itemPath = slash < 0 ? path : path.slice(0, slash);
    const destination = moveByPath.get(itemPath);
    return destination === undefined ? undefined : destination + path.slice(itemPath.length);
  };
  const warningKeys = new Set<string>();
  for (const move of moves)
    for (const key of runtime.warningKeysByPath?.get(move.previous) ?? [])
      warningKeys.add(key);
  const warningMoves: { key: string; path: string;
    record: FormErrorRecord | undefined;
    remembered: boolean }[] = [];
  for (const key of warningKeys) {
    const parts: unknown = JSON.parse(key);
    if (!isArray(parts) || typeof parts[1] !== 'string') continue;
    const path = mapPath(parts[1]);
    const record = runtime.pendingWarningRecords?.get(key);
    const remembered = runtime.warningKeys?.has(key) === true;
    indexSchemaNodeWarning(runtime, key, parts[1], undefined, true);
    if (path === undefined) continue;
    parts[1] = path;
    warningMoves.push({ key: JSON.stringify(parts), path, record, remembered });
  }
  for (const move of warningMoves) {
    if (move.remembered) (runtime.warningKeys ??= new Set()).add(move.key);
    indexSchemaNodeWarning(runtime, move.key, move.path, move.record);
  }
  const rekeyPairMap = <Value>(store: Map<string, Value> | undefined,
    transform?: (value: Value, path: string, previous: string) => Value): void => {
    if (!store) return;
    const inserts: [string, Value][] = [];
    for (const [key, value] of store) {
      const parts: unknown = JSON.parse(key);
      if (!isArray(parts) || typeof parts[0] !== 'string' ||
        !parts[0].startsWith(prefix)) continue;
      store.delete(key);
      const path = mapPath(parts[0]);
      if (path === undefined) continue;
      parts[0] = path;
      inserts.push([JSON.stringify(parts), transform
        ? transform(value, path, key) : value]);
    }
    for (const [key, value] of inserts) store.set(key, value);
  };
  rekeyPairMap(runtime.latentRaw);
  rekeyPairMap(runtime.latentRawMetadata, (metadata, path, key) => {
    const previous: unknown = JSON.parse(key);
    const position = hostPath === '' ? 0 : hostPath.split('/').length - 1;
    const order = [...metadata.order];
    if (isArray(previous) && typeof previous[0] === 'string' &&
      previous[0] !== path && order.length > position)
      order[position] = Number(path.slice(prefix.length).split('/')[0]);
    return { ...metadata, path, order };
  });
  rekeyPairMap(runtime.committedDeclarationIds);
  runtime.latentRawDirty = true;

  if (runtime.committedRuleValues) {
    const values = [...runtime.committedRuleValues];
    runtime.committedRuleValues.clear();
    runtime.committedRuleKeysBySource?.clear();
    runtime.committedRuleKeysByTarget?.clear();
    for (const [key, value] of values) {
      const parts: unknown = JSON.parse(key);
      if (!isArray(parts) || typeof parts[0] !== 'string') continue;
      const source = mapPath(parts[0]);
      const target = typeof parts[5] === 'string' ? mapPath(parts[5]) : undefined;
      if (source === undefined || (typeof parts[5] === 'string' &&
        target === undefined)) continue;
      parts[0] = source;
      if (target !== undefined) parts[5] = target;
      updateCommittedRuleValue(runtime, JSON.stringify(parts), 'set', value);
    }
  }

  const mismatches: string[] = [];
  for (const path of runtime.typeMismatchPaths) {
    if (!path.startsWith(prefix)) continue;
    runtime.typeMismatchPaths.delete(path);
    const current = mapPath(path);
    if (current !== undefined) mismatches.push(current);
  }
  for (const path of mismatches) runtime.typeMismatchPaths.add(path);

  const intersectsHost = (path: string): boolean =>
    path === hostPath || path.startsWith(prefix) ||
    (path !== '' && hostPath.startsWith(`${path}/`)) || path === '';
  for (const path of runtime.typeMismatchesMemo?.keys() ?? [])
    if (intersectsHost(path)) runtime.typeMismatchesMemo?.delete(path);
  for (const path of runtime.inactiveValuesMemo.keys())
    if (intersectsHost(path)) runtime.inactiveValuesMemo.delete(path);
  for (const key of runtime.inactiveValueEntries?.keys() ?? []) {
    const parts: unknown = JSON.parse(key);
    if (isArray(parts) && typeof parts[0] === 'string' &&
      intersectsHost(parts[0])) runtime.inactiveValueEntries?.delete(key);
  }
};
