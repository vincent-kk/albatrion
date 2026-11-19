import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';

import { type Sha256Hex, hashContent } from '../../hash/index.js';
import type { RuleSource } from '../../types/ruleSource.js';
import { isNoisePath } from '../../utils/isNoisePath.js';
import { normalizeRuleSource } from '../../utils/normalizeRuleSource.js';
import { toPosix } from '../../utils/toPosix.js';
import { walkFiles } from '../../utils/walkFiles.js';
import type { HashManifest, HashManifestSource } from '../type.js';
import { sortManifestFiles } from './sortManifestFiles.js';

/**
 * Hash an asset directory into an in-memory manifest.
 *
 * Produces the same document `scripts/buildHashes.mjs` writes for the same
 * tree, so a target resolved through `--asset-path` needs no build output:
 * same noise filter, same POSIX keys, same lexicographic key order.
 *
 * @param source - the package identity plus the asset root to hash;
 *   `assetRoot` is absolute and `assetPath` is it relative to `packageRoot`
 * @param generatedAt - ISO timestamp recorded in the manifest
 * @param ruleSources - optional run cache shared with planning and application
 * @returns the manifest; `files` is empty when `assetRoot` does not exist
 */
export async function computeHashManifest(
  source: Pick<
    HashManifestSource,
    'name' | 'version' | 'assetRoot' | 'assetPath'
  >,
  generatedAt: string,
  ruleSources?: Map<string, RuleSource | null>,
): Promise<HashManifest> {
  const files: Record<string, Sha256Hex> = {};
  const ruleBodyHashes: Record<string, Sha256Hex> = {};
  for await (const abs of walkFiles(source.assetRoot)) {
    const relPath = toPosix(relative(source.assetRoot, abs));
    if (isNoisePath(relPath)) continue;
    const cached = ruleSources?.get(abs);
    const bytes = cached?.bytes ?? (await readFile(abs));
    files[relPath] = cached?.rawHash ?? hashContent(bytes);
    if (relPath.startsWith('rules/')) {
      const body =
        cached?.body ?? normalizeRuleSource(bytes.toString('latin1'));
      const snapshot = cached ?? {
        bytes,
        rawHash: files[relPath],
        body,
        bodyHash: hashContent(Buffer.from(body, 'latin1')),
      };
      ruleSources?.set(abs, snapshot);
      ruleBodyHashes[relPath] = snapshot.bodyHash;
    }
  }
  return {
    schemaVersion: 1,
    package: { name: source.name, version: source.version },
    generatedAt,
    algorithm: 'sha256',
    assetRoot: source.assetPath,
    files: sortManifestFiles(files),
    ruleBodyHashes: sortManifestFiles(ruleBodyHashes),
    previousVersions: {},
  };
}
