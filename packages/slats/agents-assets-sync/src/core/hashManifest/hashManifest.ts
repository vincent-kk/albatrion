import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { HashManifest, HashManifestSource } from './type.js';
import { computeHashManifest } from './utils/computeHashManifest.js';

export const HASH_MANIFEST_FILENAME = 'agents-hashes.json';

/**
 * Obtain one target's manifest from whichever source it declares.
 *
 * A `directory` target ignores `dist/agents-hashes.json` entirely: the stored
 * manifest may describe a different tree than the one `--asset-path` named, so
 * the named directory is hashed on the spot and is the only truth.
 *
 * @param source - the target's identity, asset root, and chosen source
 * @param generatedAt - ISO timestamp for a computed manifest; defaults to now.
 *   Nothing at run time reads it, so the default clock is safe to take here
 * @returns the manifest
 * @throws when `hashSource` is `manifest` and the file is absent, unreadable,
 *   or declares an unsupported `schemaVersion`
 */
export async function resolveHashManifest(
  source: HashManifestSource,
  generatedAt: string = new Date().toISOString(),
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
