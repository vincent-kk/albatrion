import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { HashManifest, HashManifestSource } from './type.js';
import { computeHashManifest } from './utils/computeHashManifest.js';

export const HASH_MANIFEST_FILENAME = 'agents-hashes.json';

/**
 * Whether a target cannot be planned until its package is built.
 *
 * Only a manifest-sourced target depends on build output; one whose asset root
 * came from `--asset-path` is hashed from the directory and never reads
 * `dist/`, so a missing manifest says nothing about it. Every renderer asks
 * this before planning — the Ink path included, which is why the answer lives
 * in one place rather than three.
 *
 * @param target - the target's hash source and whether its manifest is present
 * @returns `true` when the run must stop and ask for a build
 */
export function needsBuiltManifest(target: {
  readonly hashSource: HashManifestSource['hashSource'];
  readonly hashesPresent: boolean;
}): boolean {
  return target.hashSource === 'manifest' && !target.hashesPresent;
}

/**
 * Obtain one target's manifest from whichever source it declares.
 *
 * A `directory` target ignores `dist/agents-hashes.json` entirely: the stored
 * manifest may describe a different tree than the one `--asset-path` named, so
 * the named directory is hashed on the spot and is the only truth.
 *
 * @param source - the target's identity, asset root, and chosen source
 * @param generatedAt - ISO timestamp stamped onto a computed manifest. Passed
 *   in rather than read here so the same inputs always give the same answer;
 *   the caller owns the clock
 * @returns the manifest
 * @throws when `hashSource` is `manifest` and the file is absent, unreadable,
 *   or declares an unsupported `schemaVersion`
 */
export async function resolveHashManifest(
  source: HashManifestSource,
  generatedAt: string,
): Promise<HashManifest> {
  if (source.hashSource === 'manifest')
    return readHashManifest(source.packageRoot);
  return computeHashManifest(source, generatedAt);
}

export async function readHashManifest(
  packageRoot: string,
): Promise<HashManifest> {
  const primary = join(packageRoot, 'dist', HASH_MANIFEST_FILENAME);
  const raw = await readFile(primary, 'utf-8');
  const parsed = JSON.parse(raw) as HashManifest;
  if (parsed.schemaVersion !== 1)
    throw new Error(
      `[agents-assets-sync] Unsupported manifest schemaVersion: ${parsed.schemaVersion}`,
    );
  return parsed;
}

/** Derive the set of managed namespace prefixes (e.g., "skills/<expert>/") from manifest file paths. */
export function computeNamespacePrefixes(manifest: HashManifest): string[] {
  const prefixes = new Set<string>();
  for (const relPath of Object.keys(manifest.files)) {
    const parts = relPath.split('/');
    if (parts.length >= 3 && parts[0] === 'skills')
      prefixes.add(`${parts[0]}/${parts[1]}/`);
  }
  return [...prefixes];
}
