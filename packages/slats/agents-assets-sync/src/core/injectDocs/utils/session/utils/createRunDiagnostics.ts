import type { RunFailure } from '../types.js';

/** Preserve preflight messages as structured records without changing their verdict.
 * @param errors Target-discovery, gate or argument diagnostics.
 * @param fallback Requested path when a message does not name a package.
 * @returns Records shared unchanged by all output modes.
 */
export function createRunDiagnostics(
  errors: readonly string[],
  fallback: string,
): RunFailure[] {
  return errors
    .filter((reason) => !reason.includes('does not ship agent assets'))
    .map((reason) => ({
      unitKey:
        /^Skipping (.+?): /.exec(reason)?.[1] ??
        /"([^"]+)"/.exec(reason)?.[1] ??
        fallback,
      path:
        /^Skipping (.+?): /.exec(reason)?.[1] ??
        /"([^"]+)"/.exec(reason)?.[1] ??
        fallback,
      stage: reason.includes('no source hashes') ? 'gate' : 'discover',
      reason,
    }));
}
