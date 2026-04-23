import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Sha256Hex } from '../hash/index.js';

export interface HashManifest {
  schemaVersion: 1;
  package: { name: string; version: string };
  generatedAt: string;
  algorithm: 'sha256';
  assetRoot: string;
  files: Record<string, Sha256Hex>;
  previousVersions: Record<string, never>;
}

export const HASH_MANIFEST_FILENAME = 'claude-hashes.json';

export async function readHashManifest(
  packageRoot: string,
): Promise<HashManifest> {
  const primary = join(packageRoot, 'dist', HASH_MANIFEST_FILENAME);
  const raw = await readFile(primary, 'utf-8');
  const parsed = JSON.parse(raw) as HashManifest;
  if (parsed.schemaVersion !== 1)
    throw new Error(
      `[claude-assets-sync] Unsupported manifest schemaVersion: ${parsed.schemaVersion}`,
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
