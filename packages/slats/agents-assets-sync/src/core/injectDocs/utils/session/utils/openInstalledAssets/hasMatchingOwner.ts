import { lstat, realpath } from 'node:fs/promises';
import { resolve } from 'node:path';

import { isWithin, splitAssetKind } from '../../../../../agentTarget/index.js';
import { hashEquals } from '../../../../../hash/index.js';

/**
 * Identify recorded peers with the same bytes at the same regular file.
 * @param packages Ownership snapshot by package and relative path.
 * @param owner Package whose own evidence should be ignored.
 * @param root Absolute directory containing the ownership record and asset roots.
 * @param relPath Asset spelling in the current plan.
 * @param destination Canonical absolute path to the current asset.
 * @param hash Verified asset hash for comparison with recorded hashes.
 * @returns Whether a different package recorded the file and hash.
 */
export async function hasMatchingOwner(
  packages: ReadonlyMap<string, ReadonlyMap<string, string>>,
  owner: string,
  root: string,
  relPath: string,
  destination: string,
  hash: string,
): Promise<boolean> {
  const asset = splitAssetKind(relPath)?.kind;
  for (const [peer, paths] of packages) {
    if (peer === owner) continue;
    for (const [peerPath, peerHash] of paths) {
      if (!hashEquals(peerHash, hash)) continue;
      if (peerPath === relPath) return true;
      if (splitAssetKind(peerPath)?.kind !== asset) continue;
      const candidate = resolve(root, peerPath);
      if (
        isWithin(root, candidate) &&
        (await regularPath(candidate)) === destination
      )
        return true;
    }
  }
  return false;
}

/** A peer path that cannot be read cannot prove an alias. */
async function regularPath(candidate: string): Promise<string | undefined> {
  try {
    return (await lstat(candidate)).isFile()
      ? await realpath(candidate)
      : undefined;
  } catch {
    return undefined;
  }
}
