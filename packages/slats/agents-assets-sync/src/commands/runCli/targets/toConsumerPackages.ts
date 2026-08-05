import { stat } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

import type { ConsumerPackage } from '../../../types/index.js';
import { logger } from '../../../utils/logger.js';
import type { ResolvedMetadata } from './resolvePackage.js';

/**
 * Convert dispatcher `ResolvedMetadata` into runtime `ConsumerPackage`.
 *
 * Resolves the asset root against `packageRoot`, settles where each target's
 * hashes come from, and probes for `dist/agents-hashes.json` where that is the
 * answer — so both the Ink and plain paths treat the target uniformly.
 *
 * @param metadataList - resolved dispatcher metadata, one entry per target
 * @returns the runtime targets
 */
export async function toConsumerPackages(
  metadataList: readonly ResolvedMetadata[],
): Promise<ConsumerPackage[]> {
  const result: ConsumerPackage[] = [];
  for (const metadata of metadataList) {
    if (!isAbsolute(metadata.packageRoot)) {
      logger.error(
        `packageRoot must be an absolute path; received: ${metadata.packageRoot}`,
      );
      process.exit(2);
    }
    const assetRoot = resolve(metadata.packageRoot, metadata.assetPath);
    // A flag-supplied asset root makes the directory the source of hashes, so
    // the stored manifest is never read and probing for it would say nothing.
    const hashSource =
      metadata.assetPathSource === 'flag' ? 'directory' : 'manifest';
    const hashesPath = join(metadata.packageRoot, 'dist', 'agents-hashes.json');
    const hashesPresent =
      hashSource === 'manifest' &&
      (await stat(hashesPath).then(
        () => true,
        () => false,
      ));
    result.push({
      name: metadata.packageName,
      version: metadata.packageVersion,
      packageRoot: metadata.packageRoot,
      assetRoot,
      assetPath: metadata.assetPath,
      hashesPresent,
      hashSource,
    });
  }
  return result;
}
