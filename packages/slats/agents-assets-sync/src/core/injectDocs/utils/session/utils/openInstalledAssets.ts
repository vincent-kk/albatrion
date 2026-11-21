import { splitAssetKind } from '../../../../agentTarget/index.js';
import { readRegularFile } from '../../../../hash/index.js';
import { replaceDocument } from '../../replaceDocument.js';
import type { RunUnit } from '../types.js';

/** Scope-local file ownership, created only by successful installed writes. */
export interface InstalledAssets {
  readonly path: string;
  previousPaths(owner: string): ReadonlyMap<string, string> | undefined;
  record(unit: RunUnit): Promise<void>;
}

/**
 * Read an agent target's previous successful file installations.
 * @param path The target's checked ownership record location.
 * @returns Previous ownership and an updater for successful actions.
 * @throws If an existing record is unusable or its JSON has the wrong shape.
 */
export async function openInstalledAssets(path: string): Promise<InstalledAssets> {
  const bytes = await readRegularFile(path, true);
  const packages = new Map<string, Map<string, string>>();
  if (bytes) {
    const contents: unknown = JSON.parse(bytes.toString('utf8'));
    for (const [owner, files] of recordEntries(contents, path)) {
      const hashes = new Map<string, string>();
      for (const [relPath, hash] of recordEntries(files, path)) {
        if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/i.test(hash))
          throw new Error(`Invalid installed asset hash: ${path}`);
        hashes.set(relPath, hash);
      }
      packages.set(owner, hashes);
    }
  }
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
    async record(unit) {
      const owner = unit.target.name;
      const hashes = new Map(packages.get(owner));
      let changed = false;
      for (const action of unit.plan.actions) {
        if (action.target.kind !== 'file') continue;
        const kind = splitAssetKind(action.relPath)?.kind;
        if (kind !== 'rules' && kind !== 'skills') continue;
        if (action.kind === 'delete') changed = hashes.delete(action.relPath) || changed;
        else if (
          (action.kind === 'copy' || action.kind === 'warn-diverged') &&
          action.sourceHash && action.sourceHash !== hashes.get(action.relPath)
        ) {
          hashes.set(action.relPath, action.sourceHash);
          changed = true;
        }
      }
      if (!changed) return;
      const next = new Map(packages);
      if (hashes.size) next.set(owner, hashes);
      else next.delete(owner);
      const json = Object.fromEntries(Array.from(next, ([name, files]) => [name, Object.fromEntries(files)]));
      await replaceDocument(path, Buffer.from(JSON.stringify(json) + '\n'), undefined, true);
      if (hashes.size) packages.set(owner, hashes);
      else packages.delete(owner);
    },
  };
}

/** Reject non-record JSON before its field names can become paths. */
function recordEntries(value: unknown, path: string): [string, unknown][] {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`Invalid installed asset record: ${path}`);
  return Object.entries(value);
}
