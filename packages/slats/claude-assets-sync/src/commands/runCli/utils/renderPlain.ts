import type { InjectPlan } from '../../../core/buildPlan/index.js';
import {
  type InjectReport,
  type Scope,
  applyAction,
  buildPlan,
  computeNamespacePrefixes,
  readHashManifest,
  resolveScope,
  summarize,
} from '../../../core/index.js';
import { asyncPool } from '../../../utils/asyncPool.js';
import { logger } from '../../../utils/logger.js';
import type { ConsumerPackage, DefaultFlags } from '../type.js';
import { resolveScopeFlag } from './resolveScopeFlag.js';

/**
 * Plain (picocolors) renderer for non-TTY / `--json` invocations.
 *
 * Composes the same `core/**` primitives that the Ink `useInjectSession`
 * pipeline uses — no legacy `injectDocs` orchestrator in between.
 * Missing `--scope` on non-TTY exits via `resolveScopeFlag` with code 2.
 * Divergent/orphan files still respect `--force`: absence of `--force`
 * returns 2; presence logs the list to stderr and proceeds.
 */
export async function renderPlain(
  targets: readonly ConsumerPackage[],
  flags: DefaultFlags,
  originCwd: string,
): Promise<number> {
  if (targets.length === 0) return 0;

  const scope = resolveScopeFlag(flags.scope);
  const fatalOnError = targets.length === 1;
  let failureCount = 0;

  for (const target of targets) {
    if (!target.hashesPresent) {
      logger.warn(
        `${target.name}: dist/claude-hashes.json missing — build the package (e.g. yarn build) to regenerate the hash manifest first.`,
      );
      continue;
    }

    logger.heading(`${target.name}@${target.version}`);
    let exitCode: number;
    try {
      exitCode = await renderOneTarget(target, scope, flags, originCwd);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`${target.name}: ${msg}`);
      exitCode = 1;
    }

    if (exitCode !== 0) {
      if (fatalOnError) return exitCode;
      failureCount += 1;
    }
  }

  return failureCount > 0 ? 1 : 0;
}

async function renderOneTarget(
  target: ConsumerPackage,
  scope: Scope,
  flags: DefaultFlags,
  originCwd: string,
): Promise<number> {
  const manifest = await readHashManifest(target.packageRoot);
  const resolution = resolveScope(scope, originCwd);
  const plan = await buildPlan({
    sourceHashes: manifest.files,
    targetRoot: resolution.targetRoot,
    namespacePrefixes: computeNamespacePrefixes(manifest),
    force: flags.force ?? false,
  });

  logger.info(`${target.name}@${target.version} → ${resolution.description}`);
  printPlan(plan);

  if (plan.requiresForce && !flags.force) {
    logger.error('Re-run with --force to proceed, or inspect with --dry-run.');
    return 2;
  }

  if (
    flags.force &&
    plan.actions.some(
      (a) => a.kind === 'warn-diverged' || a.kind === 'warn-orphan',
    )
  ) {
    emitForceList(plan);
  }

  if (flags.dryRun) {
    logger.warn('[DRY RUN] No files will be created, overwritten, or deleted.');
    return 0;
  }

  await asyncPool(8, plan.actions, (action) =>
    applyAction(action, target.assetRoot),
  );
  const report: InjectReport = summarize(plan, 0);
  return report.exitCode;
}

function printPlan(plan: InjectPlan): void {
  for (const action of plan.actions) {
    if (action.kind === 'copy') logger.file('create', action.relPath);
    else if (action.kind === 'skip-uptodate')
      logger.file('skip', `${action.relPath} (up-to-date)`);
    else if (action.kind === 'warn-diverged')
      logger.warn(
        `${action.relPath} — local differs from source (user edit or version change)`,
      );
    else if (action.kind === 'warn-orphan')
      logger.warn(`${action.relPath} — present locally, absent in source`);
    else if (action.kind === 'delete')
      logger.file('update', `${action.relPath} (deleting)`);
  }
}

function emitForceList(plan: InjectPlan): void {
  const divergent = plan.actions.filter(
    (action) =>
      action.kind === 'warn-diverged' || action.kind === 'warn-orphan',
  );
  process.stderr.write(
    `[claude-assets-sync] --force overwriting ${divergent.length} file(s) in non-TTY mode:\n`,
  );
  for (const action of divergent) process.stderr.write(`  ${action.relPath}\n`);
}
