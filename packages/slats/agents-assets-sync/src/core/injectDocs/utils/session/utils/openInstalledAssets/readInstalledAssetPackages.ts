import { readRegularFile } from '../../../../../hash/index.js';

/**
 * Read ownership evidence from an independent regular file.
 * @param path Absolute record path.
 * @returns Recorded hashes by package and path, or an empty map for an absent record.
 * @throws For invalid JSON, malformed hashes or file identity errors.
 */
export async function readInstalledAssetPackages(
  path: string,
): Promise<Map<string, Map<string, string>>> {
  const packages = new Map<string, Map<string, string>>();
  const bytes = await readRegularFile(path, true);
  if (!bytes) return packages;

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
  return packages;
}

/** Reject non-record JSON before its field names can become paths. */
function recordEntries(value: unknown, path: string): [string, unknown][] {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`Invalid installed asset record: ${path}`);
  return Object.entries(value);
}
