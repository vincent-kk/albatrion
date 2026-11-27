import { realpath, rmdir } from 'node:fs/promises';
import { dirname } from 'node:path';

import { splitAssetKind } from '../../../../agentTarget/index.js';
import type { Action } from '../../../../buildPlan/index.js';
import { hashEquals, hashFile } from '../../../../hash/index.js';
import { replaceDocument } from '../../replaceDocument.js';
import { hasMatchingOwner } from './openInstalledAssets/hasMatchingOwner.js';
import { lockInstalledAssetRecord } from './openInstalledAssets/lockInstalledAssetRecord.js';
import { readInstalledAssetPackages } from './openInstalledAssets/readInstalledAssetPackages.js';

/** Scope-local ownership established by writes or verified shared files. */
export interface InstalledAssets {
  readonly path: string;
  previousPaths(owner: string): ReadonlyMap<string, string> | undefined;
  /** Protect an exact path claimed by another package. */
  hasPeerPath(owner: string, relPath: string): boolean;
  /** Check peers against the physical path and hash of a regular file. */
  hasVerifiedOwner(
    owner: string,
    relPath: string,
    destination: string,
    hash: string,
  ): Promise<boolean>;
  record(
    owner: string,
    fileActions: readonly Action[],
    sharedRetirements?: readonly string[],
  ): Promise<void>;
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
    previousPaths: (owner) => packages.get(owner),
    hasPeerPath(owner, relPath) {
      for (const [peer, paths] of packages)
        if (peer !== owner && paths.has(relPath)) return true;
      return false;
    },
    hasVerifiedOwner(owner, relPath, destination, hash) {
      return hasMatchingOwner(
        packages,
        owner,
        dirname(path),
        relPath,
        destination,
        hash,
      );
    },
    async record(owner, fileActions, sharedRetirements = []) {
      const updates = new Map<string, string | undefined>(
        sharedRetirements.map((relPath) => [relPath, undefined]),
      );
      const matches: Action[] = [];
      for (const action of fileActions) {
        const { kind, relPath, sourceHash } = action;
        const asset = splitAssetKind(relPath)?.kind;
        if (asset !== 'rules' && asset !== 'skills') continue;
        if (kind === 'delete') updates.set(relPath, undefined);
        else if (kind === 'skip-uptodate') {
          if (
            sourceHash &&
            action.destinationKey &&
            packages.get(owner)?.get(relPath) !== sourceHash &&
            (await hasMatchingOwner(
              packages,
              owner,
              dirname(path),
              relPath,
              action.destinationKey,
              sourceHash,
            ))
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
            hashEquals(await hashFile(target.dstAbs, true), sourceHash) &&
            (await hasMatchingOwner(
              next,
              owner,
              dirname(path),
              relPath,
              await realpath(target.dstAbs),
              sourceHash,
            ))
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

/** Give the same ownership record a stable serialized order. */
function sortedEntries<T>(record: ReadonlyMap<string, T>): [string, T][] {
  return [...record].sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
}
