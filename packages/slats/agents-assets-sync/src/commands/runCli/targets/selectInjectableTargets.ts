import {
  HASH_MANIFEST_FILENAME,
  needsBuiltManifest,
} from '../../../core/index.js';
import type { ConsumerPackage } from '../../../types/index.js';
import { logger } from '../../../utils/logger.js';

/**
 * Drop the targets that can supply no source hashes, naming each one.
 *
 * Runs before the renderer is chosen, so all three output paths receive the
 * same set and the run's verdict cannot depend on which one was picked. The
 * verdict itself stays with the caller: this reports and filters, never exits.
 *
 * @param targets - resolved consumer packages
 * @param skipReasons - collector the caller owns; `--json` carries these as
 *   `errors`, the same channel a package with no `agents.assetPath` uses
 * @returns the targets that have a readable source of hashes, in order
 */
export function selectInjectableTargets(
  targets: readonly ConsumerPackage[],
  skipReasons: string[],
): ConsumerPackage[] {
  const injectable: ConsumerPackage[] = [];
  for (const target of targets) {
    if (!needsBuiltManifest(target)) {
      injectable.push(target);
      continue;
    }
    const reason = `"${target.name}": no source hashes — neither dist/${HASH_MANIFEST_FILENAME} nor the declared asset directory "${target.assetPath}" is there. Build the package (e.g. yarn build), or pass --asset-path to name a directory that is.`;
    logger.warn(reason);
    skipReasons.push(reason);
  }
  return injectable;
}
