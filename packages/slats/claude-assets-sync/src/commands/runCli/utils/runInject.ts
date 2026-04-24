import { stat } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

import { logger } from '../../../utils/logger.js';
import type { ConsumerPackage, DefaultFlags } from '../type.js';
import { injectOne } from './injectOne.js';
import type { ResolvedMetadata } from './resolvePackage.js';
import { resolveScopeFlag } from './resolveScopeFlag.js';

export async function runInject(
  flags: DefaultFlags,
  metadata: ResolvedMetadata,
): Promise<void> {
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

  const target: ConsumerPackage = {
    name: metadata.packageName,
    version: metadata.packageVersion,
    packageRoot: metadata.packageRoot,
    assetRoot,
    hashesPresent,
  };

  const originCwd = flags.root ?? process.cwd();
  const scope = await resolveScopeFlag(flags.scope);
  await injectOne(target, scope, flags, originCwd);
}
