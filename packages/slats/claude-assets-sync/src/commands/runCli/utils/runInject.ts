import { stat } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

import { logger } from '../../../utils/logger.js';
import type { ConsumerPackage, DefaultFlags, RunCliOptions } from '../type.js';
import { injectOne } from './injectOne.js';
import { resolveScopeFlag } from './resolveScopeFlag.js';

export async function runInject(
  flags: DefaultFlags,
  options: RunCliOptions,
): Promise<void> {
  if (
    !options.packageRoot ||
    !options.packageName ||
    !options.packageVersion ||
    !options.assetPath
  ) {
    logger.error(
      'runCli requires { packageRoot, packageName, packageVersion, assetPath }.',
    );
    process.exit(2);
  }

  if (!isAbsolute(options.packageRoot)) {
    logger.error(
      `packageRoot must be an absolute path; received: ${options.packageRoot}`,
    );
    process.exit(2);
  }

  const assetRoot = resolve(options.packageRoot, options.assetPath);
  const hashesPath = join(options.packageRoot, 'dist', 'claude-hashes.json');
  const hashesPresent = await stat(hashesPath).then(
    () => true,
    () => false,
  );

  const target: ConsumerPackage = {
    name: options.packageName,
    version: options.packageVersion,
    packageRoot: options.packageRoot,
    assetRoot,
    hashesPresent,
  };

  const originCwd = flags.root ?? process.cwd();
  const scope = await resolveScopeFlag(flags.scope);
  await injectOne(target, scope, flags, originCwd);
}
