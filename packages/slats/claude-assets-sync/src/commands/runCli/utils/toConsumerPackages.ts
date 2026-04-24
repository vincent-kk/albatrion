import { stat } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

import { logger } from '../../../utils/logger.js';
import type { ConsumerPackage } from '../type.js';
import type { ResolvedMetadata } from './resolvePackage.js';

/**
 * Convert dispatcher `ResolvedMetadata` into runtime `ConsumerPackage`.
 * Resolves the asset root against `packageRoot` and probes for
 * `dist/claude-hashes.json` presence so both the Ink and legacy paths
 * can treat the target uniformly.
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
    const hashesPath = join(metadata.packageRoot, 'dist', 'claude-hashes.json');
    const hashesPresent = await stat(hashesPath).then(
      () => true,
      () => false,
    );
    result.push({
      name: metadata.packageName,
      version: metadata.packageVersion,
      packageRoot: metadata.packageRoot,
      assetRoot,
      hashesPresent,
    });
  }
  return result;
}
