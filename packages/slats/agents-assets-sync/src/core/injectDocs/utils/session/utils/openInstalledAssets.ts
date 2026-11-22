import { rmdir } from 'node:fs/promises';

import { splitAssetKind } from '../../../../agentTarget/index.js';
import type { Action } from '../../../../buildPlan/index.js';
import { replaceDocument } from '../../replaceDocument.js';
import { lockInstalledAssetRecord } from './openInstalledAssets/lockInstalledAssetRecord.js';
import { readInstalledAssetPackages } from './openInstalledAssets/readInstalledAssetPackages.js';

/** Scope-local file ownership, created only by successful installed writes. */
export interface InstalledAssets {
  readonly path: string;
  previousPaths(owner: string): ReadonlyMap<string, string> | undefined;
  record(owner: string, fileActions: readonly Action[]): Promise<void>;
}

/**
 * Read an agent target's previous successful file installations.
 * @param path The target's checked ownership record location.
 * @returns Previous ownership and an updater for successful actions.
 * @throws If an existing record is unusable or its JSON has the wrong shape.
 */
export async function openInstalledAssets(path: string): Promise<InstalledAssets> {
  let packages = await readInstalledAssetPackages(path);
  return {
    path,
    previousPaths(owner) {
      const original = packages.get(owner);
      if (!original?.size || packages.size === 1) return original;
      const files = new Map(original);
      for (const [peer, paths] of packages)
        if (peer !== owner) for (const relPath of paths.keys()) files.delete(relPath);
      return files;
    },
    async record(owner, fileActions) {
      const updates = new Map<string, string | undefined>();
      for (const { kind, relPath, sourceHash } of fileActions) {
        const asset = splitAssetKind(relPath)?.kind;
        if (asset !== 'rules' && asset !== 'skills') continue;
        if (kind === 'delete') updates.set(relPath, undefined);
        else if (sourceHash) updates.set(relPath, sourceHash);
      }
      if (updates.size === 0) return;

      const lock = await lockInstalledAssetRecord(path);
      try {
        const next = await readInstalledAssetPackages(path);
        const hashes = new Map(next.get(owner));
        let changed = false;
        for (const [relPath, hash] of updates) {
          if (hash === undefined) changed = hashes.delete(relPath) || changed;
          else if (hash !== hashes.get(relPath)) {
            hashes.set(relPath, hash);
            changed = true;
          }
        }
        if (changed) {
          if (hashes.size) next.set(owner, hashes);
          else next.delete(owner);
          const json = Object.fromEntries(
            sortedEntries(next).map(([name, files]) => [
              name,
              Object.fromEntries(sortedEntries(files)),
            ]),
          );
          await replaceDocument(
            path,
            Buffer.from(JSON.stringify(json) + '\n'),
            undefined,
            true,
          );
        }
        packages = next;
      } finally {
        await rmdir(lock);
      }
    },
  };
}

/** Give the same ownership record a stable serialized order. */
function sortedEntries<T>(record: ReadonlyMap<string, T>): [string, T][] {
  return [...record].sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
}
