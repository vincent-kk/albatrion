import { asyncPool } from '../../utils/asyncPool.js';
import { logger } from '../../utils/logger.js';
import { buildPlan } from '../buildPlan/index.js';
import {
  computeNamespacePrefixes,
  readHashManifest,
} from '../hashManifest/index.js';
import { isInteractive, resolveScope } from '../scope/index.js';
import type { InjectOptions, InjectReport } from './type.js';
import { applyAction } from './utils/applyAction.js';
import { emitCiForceList } from './utils/emitCiForceList.js';
import { printPlan } from './utils/printPlan.js';
import { summarize } from './utils/summarize.js';

export async function injectDocs(opts: InjectOptions): Promise<InjectReport> {
  const manifest = await readHashManifest(opts.packageRoot);
  const resolution = resolveScope(opts.scope, opts.originCwd ?? process.cwd());
  const plan = await buildPlan({
    sourceHashes: manifest.files,
    targetRoot: resolution.targetRoot,
    namespacePrefixes: computeNamespacePrefixes(manifest),
    force: opts.force,
  });

  logger.info(
    `${opts.packageName}@${opts.packageVersion} → ${resolution.description}`,
  );
  printPlan(plan);

  if (plan.requiresForce && !opts.force) {
    logger.error('Re-run with --force to proceed, or inspect with --dry-run.');
    return summarize(plan, 2);
  }

  if (
    opts.force &&
    plan.actions.some(
      (a) => a.kind === 'warn-diverged' || a.kind === 'warn-orphan',
    )
  ) {
    if (!isInteractive()) emitCiForceList(plan);
    else if (opts.confirmForce && !(await opts.confirmForce(plan)))
      return summarize(plan, 2);
  }

  if (opts.dryRun) {
    logger.warn('[DRY RUN] No files will be created, overwritten, or deleted.');
    return summarize(plan, 0);
  }

  await asyncPool(8, plan.actions, (action) =>
    applyAction(action, opts.assetRoot),
  );
  return summarize(plan, 0);
}
