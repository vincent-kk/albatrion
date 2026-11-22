import { lstat, realpath, rmdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { isWithin, splitAssetKind } from '../../../../agentTarget/index.js';
import type { Action } from '../../../../buildPlan/index.js';
import { hashEquals, hashFile } from '../../../../hash/index.js';
import { replaceDocument } from '../../replaceDocument.js';
import { lockInstalledAssetRecord } from './openInstalledAssets/lockInstalledAssetRecord.js';
import { readInstalledAssetPackages } from './openInstalledAssets/readInstalledAssetPackages.js';

/** Scope-local ownership established by writes or verified shared files. */
export interface InstalledAssets {
  readonly path: string;
  previousPaths(owner: string): ReadonlyMap<string, string> | undefined;
  /** Checks peer keys against a retired regular file whose hash is already verified. */
  hasVerifiedAlias(
    owner: string,
    relPath: string,
    destination: string,
    hash: string,
  ): Promise<boolean>;
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
    async hasVerifiedAlias(owner, relPath, destination, hash) {
      const asset = splitAssetKind(relPath)?.kind;
      const root = dirname(path);
      for (const [peer, paths] of packages) {
        if (peer === owner) continue;
        for (const [peerPath, peerHash] of paths) {
          if (peerPath === relPath || !hashEquals(peerHash, hash)) continue;
          if (splitAssetKind(peerPath)?.kind !== asset) continue;
          const candidate = resolve(root, peerPath);
          if (!isWithin(root, candidate)) continue;
          try {
            if (
              (await realpath(candidate)) === destination &&
              (await lstat(candidate)).isFile()
            )
              return true;
          } catch (error) {
            if (
              !(error instanceof Error && 'code' in error) ||
              (error.code !== 'ENOENT' && error.code !== 'ENOTDIR')
            )
              throw error;
          }
        }
      }
      return false;
    },
    async record(owner, fileActions) {
      const updates = new Map<string, string | undefined>();
      const matches: Action[] = [];
      for (const action of fileActions) {
        const { kind, relPath, sourceHash } = action;
        const asset = splitAssetKind(relPath)?.kind;
        if (asset !== 'rules' && asset !== 'skills') continue;
        if (kind === 'delete') updates.set(relPath, undefined);
        else if (kind === 'skip-uptodate') {
          if (
            sourceHash &&
            packages.get(owner)?.get(relPath) !== sourceHash &&
            hasMatchingOwner(packages, owner, relPath, sourceHash)
          )
            matches.push(action);
        } else if (sourceHash) updates.set(relPath, sourceHash);
      }
      if (updates.size === 0 && matches.length === 0) return;

      const lock = await lockInstalledAssetRecord(path);
      try {
        const next = await readInstalledAssetPackages(path);
        for (const { relPath, sourceHash, target } of matches)
          if (
            target.kind === 'file' &&
            sourceHash &&
            hasMatchingOwner(next, owner, relPath, sourceHash) &&
            hashEquals(await hashFile(target.dstAbs, true), sourceHash)
          )
            updates.set(relPath, sourceHash);
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

/** Check whether another package recorded the supplied path and bytes. */
function hasMatchingOwner(
  packages: ReadonlyMap<string, ReadonlyMap<string, string>>,
  owner: string,
  relPath: string,
  hash: string,
): boolean {
  for (const [peer, paths] of packages)
    if (peer !== owner && hashEquals(paths.get(relPath) ?? null, hash))
      return true;
  return false;
}

/** Give the same ownership record a stable serialized order. */
function sortedEntries<T>(record: ReadonlyMap<string, T>): [string, T][] {
  return [...record].sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
}
