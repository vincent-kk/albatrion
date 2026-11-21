import type { RunFailure, RunResult } from '../../../core/index.js';

/** Build a preflight failure as the same final model used after execution.
 * @param errors Complete diagnostics collected before planning.
 * @param exitCode Existing CLI verdict for this failure.
 * @param dryRun Whether the request was a preview.
 * @param path Requested target or path that could not be resolved.
 * @returns A completed report ready for any renderer.
 */
export function createFailureResult(
  errors: readonly string[],
  exitCode: 1 | 2,
  dryRun: boolean,
  path: string,
  diagnostics?: readonly RunFailure[],
): RunResult {
  return {
    units: [],
    errors,
    exitCode,
    dryRun,
    failures:
      diagnostics ??
      errors.map((reason) => ({
        unitKey: path,
        path,
        stage: reason.includes('no source hashes') ? 'gate' : 'discover',
        reason,
      })),
    notices: [],
  };
}
