import type { Sha256Hex } from '../../hash/index.js';

/**
 * Order a manifest's entries by path, lexicographically.
 *
 * The order matters because the manifest is a file people read and diff: an
 * entry that moves only because the filesystem handed its directory back in a
 * different order would show up as a change that is not one. `readdir` order
 * is the platform's to choose, so this is split out to be given unsorted input
 * directly — a fixture on disk cannot prove the sort ran.
 *
 * Kept identical to the comparator in `scripts/buildHashes.mjs`; the two must
 * agree or a computed manifest and a built one differ by key order alone.
 *
 * @param files - manifest path → source hash, in any order
 * @returns the same entries, keyed in ascending path order
 */
export function sortManifestFiles(
  files: Record<string, Sha256Hex>,
): Record<string, Sha256Hex> {
  return Object.fromEntries(
    Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
}
