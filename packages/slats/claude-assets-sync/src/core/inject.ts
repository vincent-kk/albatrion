import { mkdir, copyFile, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { asyncPool } from '../utils/asyncPool.js';
import { logger } from '../utils/logger.js';
import { computeNamespacePrefixes, readHashManifest } from './hashManifest.js';
import { buildPlan, type Action, type InjectPlan } from './injectPlan.js';
import { isInteractive, resolveScope, type Scope } from './scope.js';

export interface InjectOptions {
  packageName: string;
  packageVersion: string;
  packageRoot: string;
  assetRoot: string;
  scope: Scope;
  dryRun: boolean;
  force: boolean;
  /**
   * Origin directory used to resolve project/local scope targets. When set,
   * `resolveScope` walks up from this path to find the nearest existing
   * `.claude` ancestor. Defaults to `process.cwd()`.
   */
  originCwd?: string;
  /** Called AFTER plan is built but BEFORE apply. Return false to abort. */
  confirmForce?: (plan: InjectPlan) => Promise<boolean>;
}

export interface InjectReport {
  created: string[];
  updated: string[];
  skipped: string[];
  warnings: { relPath: string; reason: string }[];
  deleted: string[];
  exitCode: 0 | 1 | 2;
}

export async function injectDocs(opts: InjectOptions): Promise<InjectReport> {
  const manifest = await readHashManifest(opts.packageRoot);
  const resolution = resolveScope(opts.scope, opts.originCwd ?? process.cwd());
  const plan = await buildPlan({
    sourceHashes: manifest.files,
    targetRoot: resolution.targetRoot,
    namespacePrefixes: computeNamespacePrefixes(manifest),
    force: opts.force,
  });

  logger.info(`${opts.packageName}@${opts.packageVersion} → ${resolution.description}`);
  printPlan(plan);

  if (plan.requiresForce && !opts.force) {
    logger.error('Re-run with --force to proceed, or inspect with --dry-run.');
    return summarize(plan, 2);
  }

  if (opts.force && plan.actions.some((a) => a.kind === 'warn-diverged' || a.kind === 'warn-orphan')) {
    if (!isInteractive()) emitCiForceList(plan);
    else if (opts.confirmForce && !(await opts.confirmForce(plan)))
      return summarize(plan, 2);
  }

  if (opts.dryRun) {
    logger.warn('[DRY RUN] No files will be created, overwritten, or deleted.');
    return summarize(plan, 0);
  }

  await asyncPool(8, plan.actions, (action) => applyAction(action, opts.assetRoot));
  return summarize(plan, 0);
}

async function applyAction(action: Action, assetRoot: string): Promise<void> {
  if (action.kind === 'copy') {
    const srcAbs = join(assetRoot, action.relPath);
    await mkdir(dirname(action.dstAbs), { recursive: true });
    await copyFile(srcAbs, action.dstAbs);
  } else if (action.kind === 'delete') {
    await unlink(action.dstAbs).catch(() => undefined);
  }
}

function printPlan(plan: InjectPlan): void {
  for (const a of plan.actions) {
    if (a.kind === 'copy') logger.file('create', a.relPath);
    else if (a.kind === 'skip-uptodate') logger.file('skip', `${a.relPath} (up-to-date)`);
    else if (a.kind === 'warn-diverged')
      logger.warn(`${a.relPath} — local differs from source (user edit or version change)`);
    else if (a.kind === 'warn-orphan')
      logger.warn(`${a.relPath} — present locally, absent in source`);
    else if (a.kind === 'delete') logger.file('update', `${a.relPath} (deleting)`);
  }
}

function emitCiForceList(plan: InjectPlan): void {
  const divergent = plan.actions.filter((a) => a.kind === 'warn-diverged' || a.kind === 'warn-orphan');
  process.stderr.write(
    `[claude-assets-sync] --force overwriting ${divergent.length} file(s) in non-TTY mode:\n`,
  );
  for (const a of divergent) process.stderr.write(`  ${a.relPath}\n`);
}

function summarize(plan: InjectPlan, exitCode: 0 | 1 | 2): InjectReport {
  const report: InjectReport = { created: [], updated: [], skipped: [], warnings: [], deleted: [], exitCode };
  for (const a of plan.actions) {
    if (a.kind === 'copy') report.created.push(a.relPath);
    else if (a.kind === 'skip-uptodate') report.skipped.push(a.relPath);
    else if (a.kind === 'warn-diverged')
      report.warnings.push({ relPath: a.relPath, reason: 'diverged' });
    else if (a.kind === 'warn-orphan')
      report.warnings.push({ relPath: a.relPath, reason: 'orphan' });
    else if (a.kind === 'delete') report.deleted.push(a.relPath);
  }
  return report;
}
