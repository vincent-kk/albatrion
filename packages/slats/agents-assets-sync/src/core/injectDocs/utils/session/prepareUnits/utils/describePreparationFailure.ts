import type { ConsumerPackage } from '../../../../../../types/index.js';
import type { RunFailure } from '../../types.js';

/** Retain the exact path supplied by IO or Markdown validation.
 * @param error Failure thrown while preparing one participant.
 * @param target Package roots used when no native path is available.
 * @param manifestFailure Whether reading the stored hash manifest failed.
 * @returns The common path and reason fields for every output mode.
 */
export function describePreparationFailure(
  error: unknown,
  target: Pick<ConsumerPackage, 'assetRoot' | 'packageRoot'>,
  manifestFailure: boolean,
): Pick<RunFailure, 'path' | 'reason'> {
  const reason = error instanceof Error ? error.message : String(error);
  if (
    error instanceof Error &&
    'path' in error &&
    typeof error.path === 'string'
  )
    return { path: error.path, reason };
  const markdown = /^(.+?):\d+:/.exec(reason)?.[1];
  const source = /Source file missing: (.+)/.exec(reason)?.[1];
  const path =
    markdown ??
    (manifestFailure
      ? `${target.packageRoot}/dist/agents-hashes.json`
      : source
        ? `${target.assetRoot}/${source}`
        : target.assetRoot);
  return { path, reason };
}
