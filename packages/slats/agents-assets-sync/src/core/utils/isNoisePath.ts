// Byte-identical to the list in `scripts/buildHashes.mjs`, which must stay pure
// Node ESM for rolldown and so cannot import this one;
// `hashManifest/__tests__/computeHashManifest.spec.ts` pins both to one output.
const NOISE = [
  /(^|\/)\.omc(\/|$)/,
  /(^|\/)\.DS_Store$/,
  /\.log$/,
  /(^|\/)\.agents-assets-sync-[^/]*(\/|$)/,
];

/**
 * Decide whether a path is tool or OS noise that is never shipped as an asset.
 *
 * The source hasher drops these paths, so the same test keeps the orphan scan
 * from proposing to delete a file this package never installed.
 *
 * @param relPath - POSIX path relative to an asset root or an installed
 *   skill namespace
 * @returns `true` for an `.omc` segment, a `.DS_Store` file or a `*.log` file
 */
export function isNoisePath(relPath: string): boolean {
  return NOISE.some((pattern) => pattern.test(relPath));
}
