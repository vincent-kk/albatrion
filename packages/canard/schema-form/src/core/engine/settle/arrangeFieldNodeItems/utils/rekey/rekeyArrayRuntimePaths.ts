import { isArray } from '@winglet/common-utils/filter';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { FormErrorRecord } from '../../../../../../errors';
import type { FieldNodeRuntime } from '../../../../record';
import { indexFieldNodeWarning } from '../../../../record';
import { getRuntimePathStores } from '../../../utils/pathStores/getRuntimePathStores';
import { prunePerishedPaths } from '../../../utils/transition/prunePerishedPaths';
import type { ArrayPathMove } from '../../types/pathMoves';
import { rekeyCommittedRules } from './rekeyCommittedRules';
import { rekeyLatentMetadata } from './rekeyLatentMetadata';
import { rekeyPairedPathStore } from './rekeyPairedPathStore';

export type { ArrayPathMove } from '../../types/pathMoves';

/**
 * Move indexed entries in two phases so chained shifts cannot collide.
 * @param runtime - Tree-owned stores and their persistent path indexes
 * @param hostPath - Array host whose position paths are being replaced
 * @param moves - Old slots after the preserved prefix, without destinations for perished slots
 * @param preservedPrefixCount - Proven unchanged leading positions; zero for a general plan
 * @returns Nothing; affected cached views are invalidated
 */
export const rekeyArrayRuntimePaths = <Self>(
  runtime: FieldNodeRuntime<Self>,
  hostPath: string,
  moves: readonly ArrayPathMove[],
  preservedPrefixCount: number = 0,
): void => {
  const stores = getRuntimePathStores(runtime);
  const unaddressed = new Set<string>();
  for (const store of [
    stores.latent,
    stores.metadata,
    stores.declarations,
    stores.rules,
    stores.misfits,
  ])
    for (const path of store.pathIndex.tail(
      hostPath,
      preservedPrefixCount + moves.length,
    ))
      unaddressed.add(path);
  prunePerishedPaths(runtime, unaddressed);
  const changed = moves.filter((move) => move.previous !== move.current);
  const prefix = hostPath + '/';
  const moveByPath = new Map(
    moves.map((move) => [move.previous, move.current]),
  );
  const mapPath = (path: string): string | undefined => {
    if (!path.startsWith(prefix)) return path;
    const slash = path.indexOf($.Separator, prefix.length);
    const itemPath = slash < 0 ? path : path.slice(0, slash);
    const position = Number(itemPath.slice(prefix.length));
    if (position >= 0 && position < preservedPrefixCount) return path;
    const destination = moveByPath.get(itemPath);
    return destination === undefined
      ? undefined
      : destination + path.slice(itemPath.length);
  };
  const warningKeys = new Set<string>();
  for (const move of changed)
    for (const key of runtime.warningKeysByPath?.get(move.previous) ?? [])
      warningKeys.add(key);
  const warningMoves: {
    key: string;
    path: string;
    record: FormErrorRecord | undefined;
    remembered: boolean;
  }[] = [];
  for (const key of warningKeys) {
    const parts: unknown = JSON.parse(key);
    if (!isArray(parts) || typeof parts[1] !== 'string') continue;
    const path = mapPath(parts[1]);
    const record = runtime.pendingWarningRecords?.get(key);
    const remembered = runtime.warningKeys?.has(key) === true;
    indexFieldNodeWarning(runtime, key, parts[1], undefined, true);
    if (path === undefined) continue;
    parts[1] = path;
    warningMoves.push({ key: JSON.stringify(parts), path, record, remembered });
  }
  for (const move of warningMoves) {
    if (move.remembered) (runtime.warningKeys ??= new Set()).add(move.key);
    indexFieldNodeWarning(runtime, move.key, move.path, move.record);
  }
  const latentChanged = changed.some(
    (move) =>
      stores.latent.pathIndex.under(move.previous).size > 0 ||
      stores.metadata.pathIndex.under(move.previous).size > 0,
  );
  rekeyPairedPathStore(stores.latent, changed, mapPath);
  rekeyPairedPathStore(
    stores.metadata,
    changed,
    mapPath,
    (metadata, path, previous) =>
      rekeyLatentMetadata(metadata, path, previous, hostPath, runtime),
  );
  rekeyPairedPathStore(stores.declarations, changed, mapPath);
  if (latentChanged) runtime.latentRawDirty = true;
  rekeyCommittedRules(runtime, changed, mapPath);

  const misfitKeys = new Set<string>();
  for (const move of changed)
    for (const path of stores.misfits.pathIndex.under(move.previous))
      misfitKeys.add(path);
  const misfits: { previous: string; current?: string }[] = [];
  for (const path of misfitKeys) {
    const current = mapPath(path);
    misfits.push({ previous: path, current });
  }
  stores.misfits.replacePaths(misfits);

  for (const store of [
    stores.misfitsMemo,
    stores.inactiveMemo,
    stores.inactiveEntries,
  ]) {
    if (
      store !== stores.misfitsMemo &&
      !latentChanged &&
      !runtime.latentRawDirty
    )
      continue;
    const keys = new Set<string>();
    for (const move of changed)
      for (const key of store.pathIndex.intersecting(move.previous))
        keys.add(key);
    for (const key of keys) store.delete(key);
  }
};
