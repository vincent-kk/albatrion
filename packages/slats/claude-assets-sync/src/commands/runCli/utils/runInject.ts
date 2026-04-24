import { stat } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

import { logger } from '../../../utils/logger.js';
import type { ConsumerPackage, DefaultFlags } from '../type.js';
import { injectOne } from './injectOne.js';
import type { ResolvedMetadata } from './resolvePackage.js';
import { resolveScopeFlag } from './resolveScopeFlag.js';

export async function runInject(
  flags: DefaultFlags,
  metadataList: readonly ResolvedMetadata[],
): Promise<void> {
  if (metadataList.length === 0) return;

  for (const metadata of metadataList) {
    if (!isAbsolute(metadata.packageRoot)) {
      logger.error(
        `packageRoot must be an absolute path; received: ${metadata.packageRoot}`,
      );
      process.exit(2);
    }
  }

  const originCwd = flags.root ?? process.cwd();
  const scope = await resolveScopeFlag(flags.scope);
  const fatalOnError = metadataList.length === 1;

  let failureCount = 0;
  for (const metadata of metadataList) {
    const assetRoot = resolve(metadata.packageRoot, metadata.assetPath);
    const hashesPath = join(metadata.packageRoot, 'dist', 'claude-hashes.json');
    const hashesPresent = await stat(hashesPath).then(
      () => true,
      () => false,
    );

    const target: ConsumerPackage = {
      name: metadata.packageName,
      version: metadata.packageVersion,
      packageRoot: metadata.packageRoot,
      assetRoot,
      hashesPresent,
    };

    let exitCode: number;
    try {
      exitCode = await injectOne(target, scope, flags, originCwd);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`${target.name}: ${msg}`);
      exitCode = 1;
    }

    if (exitCode !== 0) {
      if (fatalOnError) process.exit(exitCode);
      failureCount += 1;
    }
  }

  if (failureCount > 0) process.exit(1);
}
