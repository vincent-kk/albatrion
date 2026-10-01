import { isArray } from '@winglet/common-utils/filter';
import type { FormErrorRecord } from '../../../../errors';
import type { SchemaNodeRuntime } from '../../../record';
import { indexSchemaNodeWarning } from '../../../record';
import { getRuntimePathStores } from '../pathIndex/getRuntimePathStores';
import { prunePerishedPaths } from '../transition/prunePerishedPaths';
import { rekeyPairedPathStore } from './utils/rekeyPairedPathStore';
import { rekeyCommittedRules } from './utils/rekeyCommittedRules';
import { rekeyLatentMetadata } from './utils/rekeyLatentMetadata';
import type { ArrayPathMove } from './type';

export type { ArrayPathMove } from './type';

/**
 * Move indexed entries in two phases so chained shifts cannot collide.
 * @param runtime - Tree-owned stores and their persistent path indexes
 * @param hostPath - Array host whose position paths are being replaced
 * @param moves - Every old slot in order, with destinations absent for perished slots
 * @returns Nothing; affected cached views are invalidated
 */
export const rekeyArrayRuntimePaths = <Self>(
  runtime: SchemaNodeRuntime<Self>, hostPath: string,
  moves: readonly ArrayPathMove[],
): void => {
  const stores = getRuntimePathStores(runtime);
  const unaddressed = new Set<string>();
  for (const store of [stores.latent, stores.metadata, stores.declarations,
    stores.rules, stores.mismatches])
    for (const path of store.pathIndex.tail(hostPath, moves.length)) unaddressed.add(path);
  prunePerishedPaths(runtime, unaddressed);
  const changed = moves.filter((move) => move.previous !== move.current);
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
  for (const move of changed)
    for (const key of runtime.warningKeysByPath?.get(move.previous) ?? [])
      warningKeys.add(key);
  const warningMoves: { key: string; path: string;
    record: FormErrorRecord | undefined; remembered: boolean }[] = [];
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
  const latentChanged = changed.some((move) =>
    stores.latent.pathIndex.under(move.previous).size > 0 ||
    stores.metadata.pathIndex.under(move.previous).size > 0);
  rekeyPairedPathStore(stores.latent, changed, mapPath);
  rekeyPairedPathStore(stores.metadata, changed, mapPath,
    (metadata, path, previous) => rekeyLatentMetadata(metadata, path, previous, hostPath));
  rekeyPairedPathStore(stores.declarations, changed, mapPath);
  if (latentChanged) runtime.latentRawDirty = true;
  rekeyCommittedRules(runtime, changed, mapPath);

  const mismatchKeys = new Set<string>();
  for (const move of changed)
    for (const path of stores.mismatches.pathIndex.under(move.previous)) mismatchKeys.add(path);
  const mismatches: { previous: string; current?: string }[] = [];
  for (const path of mismatchKeys) {
    const current = mapPath(path);
    mismatches.push({ previous: path, current });
  }
  stores.mismatches.replacePaths(mismatches);

  for (const store of [stores.mismatchMemo, stores.inactiveMemo, stores.inactiveEntries]) {
    if (store !== stores.mismatchMemo && !latentChanged && !runtime.latentRawDirty) continue;
    const keys = new Set<string>();
    for (const move of changed)
      for (const key of store.pathIndex.intersecting(move.previous)) keys.add(key);
    for (const key of keys) store.delete(key);
  }
};
