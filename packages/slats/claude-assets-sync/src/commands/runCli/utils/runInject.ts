import { discover } from '../../../discover/index.js';
import { logger } from '../../../utils/logger.js';
import type { DefaultFlags, RunCliOptions } from '../type.js';
import { injectOne } from './injectOne.js';
import { resolveCwdPackageName } from './resolveCwdPackageName.js';
import { resolveInvokedPackageName } from './resolveInvokedPackageName.js';
import { resolveScopeFlag } from './resolveScopeFlag.js';
import { resolveTargets } from './resolveTargets.js';

export async function runInject(
  flags: DefaultFlags,
  options: RunCliOptions,
): Promise<void> {
  const originCwd = flags.root ?? process.cwd();

  const all = await discover({
    cwd: originCwd,
    includeWorkspaces: flags.workspaces ?? true,
  });

  if (all.length === 0) {
    logger.error(
      'No consumer packages with claude.assetPath found in this tree.',
    );
    logger.error(
      '  Ensure the target package.json has a `"claude": { "assetPath": "..." }` field.',
    );
    process.exit(1);
  }

  const invokedPackageName = options.invokedFromBin
    ? await resolveInvokedPackageName(options.invokedFromBin)
    : null;
  const cwdPackageName = resolveCwdPackageName(all, originCwd);

  const targets = resolveTargets(
    all,
    flags,
    cwdPackageName,
    invokedPackageName,
  );
  const scope = await resolveScopeFlag(flags.scope);

  for (const target of targets) {
    await injectOne(target, scope, flags, originCwd);
  }
}
