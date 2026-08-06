import { isAbsolute, resolve } from 'node:path';

import type { ConsumerPackage } from '../../../types/index.js';
import { logger } from '../../../utils/logger.js';
import { resolveHashSource } from './resolveHashSource.js';
import type { ResolvedMetadata } from './resolvePackage.js';

/**
 * Convert dispatcher `ResolvedMetadata` into runtime `ConsumerPackage`.
 *
 * Resolves the asset root against `packageRoot` and hands the hash-source
 * decision to `resolveHashSource` — so both the Ink and plain paths treat the
 * target uniformly.
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
    const { hashSource, hashesPresent } = await resolveHashSource(
      metadata,
      assetRoot,
    );
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
