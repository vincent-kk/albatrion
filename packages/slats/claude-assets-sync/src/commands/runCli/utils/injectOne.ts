import { type Scope, injectDocs } from '../../../core/index.js';
import { confirmForceAsync } from '../../../prompts/index.js';
import { startHeartbeat } from '../../../utils/heartbeat.js';
import { logger } from '../../../utils/logger.js';
import type { ConsumerPackage, DefaultFlags } from '../type.js';

export async function injectOne(
  target: ConsumerPackage,
  scope: Scope,
  flags: DefaultFlags,
  originCwd: string,
): Promise<void> {
  if (!target.hashesPresent) {
    logger.warn(
      `${target.name}: dist/claude-hashes.json missing — build the package (e.g. yarn build) to regenerate the hash manifest first.`,
    );
    return;
  }

  logger.heading(`${target.name}@${target.version}`);

  const stopHeartbeat = startHeartbeat({
    label: `injecting ${target.name}`,
  });

  try {
    const report = await injectDocs({
      packageName: target.name,
      packageVersion: target.version,
      packageRoot: target.packageRoot,
      assetRoot: target.assetRoot,
      scope,
      originCwd,
      dryRun: flags.dryRun ?? false,
      force: flags.force ?? false,
      confirmForce: async (plan) => {
        const diverged = plan.actions.filter((a) => a.kind === 'warn-diverged');
        const orphans = plan.actions.filter((a) => a.kind === 'warn-orphan');
        return confirmForceAsync(
          diverged.length,
          orphans.length,
          [...diverged, ...orphans].map((a) => a.relPath).slice(0, 3),
        );
      },
    });
    if (report.exitCode !== 0) process.exit(report.exitCode);
  } finally {
    stopHeartbeat();
  }
}
