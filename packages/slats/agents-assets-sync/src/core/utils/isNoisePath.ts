// Kept byte-identical to the list in `scripts/buildHashes.mjs`. The ban runs
// one way — that script may not import from `src/`, because it must stay pure
// Node ESM for rolldown — so a shared home would have to live under `scripts/`
// with a hand-written `.d.mts`, the arrangement whose declaration drifted once
// already. Until that trade is taken, `__tests__/computeHashManifest.spec.ts`
// is what pins the two copies to the same output.
const NOISE = [/(^|\/)\.omc(\/|$)/, /(^|\/)\.DS_Store$/, /\.log$/];

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
