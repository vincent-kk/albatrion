import { getChildPointer, readPointerSegment, rebasePointer } from '@/schema-form/helpers/jsonPointer';
import { isArray } from '@winglet/common-utils/filter';


import type { FormErrorRecord } from '../../../../../../errors';
import type { FieldNodeRuntime } from '../../../../record';
import { indexFieldNodeWarning } from '../../../../record';
import { getRuntimePathStores } from '../../../utils/pathStores/getRuntimePathStores';
import { prunePerishedPaths } from '../../../utils/transition/prunePerishedPaths';
import type { ArrayPathMove } from '../../types/pathMoves';
import { rekeyCommittedRules } from './rekeyCommittedRules';
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
  for (const store of [stores.declarations, stores.rules, stores.misfits]) {
    if (!store) continue;
    for (const path of store.pathIndex.tail(
      hostPath,
      preservedPrefixCount + moves.length,
    ))
      unaddressed.add(path);
  }
  prunePerishedPaths(runtime, unaddressed);
  const changed = moves.filter((move) => move.previous !== move.current);
  const moveByPath = new Map(
    moves.map((move) => [move.previous, move.current]),
  );
  const mapPath = (path: string): string | undefined => {
    const itemPath = getChildPointer(path, hostPath);
    if (itemPath === undefined) return path;
    const position = Number(readPointerSegment(itemPath, -1));
    if (position >= 0 && position < preservedPrefixCount) return path;
    const destination = moveByPath.get(itemPath);
    return destination === undefined
      ? undefined
      : rebasePointer(path, itemPath, destination);
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
  rekeyPairedPathStore(stores.declarations, changed, mapPath);
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

  for (const store of [stores.misfitsMemo]) {
    if (!store) continue;

    const keys = new Set<string>();
    for (const move of changed)
      for (const key of store.pathIndex.intersecting(move.previous))
        keys.add(key);
    for (const key of keys) store.delete(key);
  }
};
