import type { Command } from 'commander';
import { join } from 'node:path';

import { injectDocs } from '../core/inject.js';
import { isInteractive, isValidScope, type Scope } from '../core/scope.js';
import { startHeartbeat } from '../utils/heartbeat.js';
import { logger } from '../utils/logger.js';

export interface InjectCommandContext {
  packageName: string;
  packageVersion: string;
  packageRoot: string;
  assetRoot?: string;
  /** Scope picker. Default: src/prompts/selectScope. */
  renderScopeSelect?: () => Promise<Scope>;
  /** Force confirmation prompt. Default: src/prompts/confirmForce. */
  renderForceConfirm?: (divergedCount: number, orphanCount: number, relPaths: string[]) => Promise<boolean>;
}

export function registerInjectCommand(cmd: Command, ctx: InjectCommandContext): void {
  cmd
    .name('inject-docs')
    .description(`Inject Claude docs bundled with ${ctx.packageName}`)
    .version(ctx.packageVersion)
    .option('--scope <scope>', 'Target: user | project | local')
    .option('--dry-run', 'Preview without writing', false)
    .option('--force', 'Overwrite user modifications', false)
    .action(async (flags: { scope?: string; dryRun?: boolean; force?: boolean }) => {
      const scope = await resolveScopeOrThrow(flags.scope, ctx);
      const assetRoot = ctx.assetRoot ?? join(ctx.packageRoot, 'docs', 'claude');
      const stopHeartbeat = startHeartbeat({ label: `injecting ${ctx.packageName}` });
      try {
        const report = await injectDocs({
          packageName: ctx.packageName,
          packageVersion: ctx.packageVersion,
          packageRoot: ctx.packageRoot,
          assetRoot,
          scope,
          dryRun: flags.dryRun ?? false,
          force: flags.force ?? false,
          confirmForce: async (plan) => {
            if (!ctx.renderForceConfirm) return true;
            const diverged = plan.actions.filter((a) => a.kind === 'warn-diverged');
            const orphans = plan.actions.filter((a) => a.kind === 'warn-orphan');
            return ctx.renderForceConfirm(
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
    });
}

async function resolveScopeOrThrow(
  flag: string | undefined,
  ctx: InjectCommandContext,
): Promise<Scope> {
  if (flag) {
    if (!isValidScope(flag)) {
      logger.error(`Invalid --scope: ${flag}. Expected user | project | local.`);
      process.exit(2);
    }
    return flag;
  }
  if (!isInteractive()) {
    logger.error('--scope is required in non-interactive environments.');
    logger.error('  Pass --scope=user | --scope=project | --scope=local.');
    process.exit(2);
  }
  if (!ctx.renderScopeSelect) {
    logger.error('Interactive scope picker is unavailable in this build.');
    process.exit(2);
  }
  return ctx.renderScopeSelect();
}
