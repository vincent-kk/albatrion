import { isAbsolute } from 'node:path';

import { logger } from '../../../utils/logger.js';

/**
 * Validate the shape of `--asset-path`.
 *
 * Only what holds for every target is decided here: the value must be a
 * non-empty path relative to a package root. Whether it stays inside that root
 * and names a real directory depends on which package is being resolved, so
 * `resolvePackage` judges that per target.
 *
 * Runs in the action, before any renderer exists, so a bad value exits rather
 * than becoming a reported value — `--json` included, which leaves stdout
 * empty exactly as a missing `--package` does.
 *
 * @param value - the raw `--asset-path` value, or `undefined` when unset
 * @returns the value unchanged, or `undefined` when the flag was not passed
 */
export function resolveAssetPathFlag(
  value: string | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || isAbsolute(trimmed) || trimmed.startsWith('~')) {
    logger.error(
      `Invalid --asset-path: ${JSON.stringify(value)}. Expected a non-empty path relative to the package root (e.g. agents or docs/agents).`,
    );
    process.exit(2);
  }
  return trimmed;
}
