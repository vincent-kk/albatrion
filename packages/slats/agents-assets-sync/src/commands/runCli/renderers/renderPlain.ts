import { runInjection, type RunResult, type InjectPlan, type AgentTarget, type ActionTarget } from '../../../core/index.js';
import type { ConsumerPackage, DefaultFlags } from '../../../types/index.js';
import { logger } from '../../../utils/logger.js';

/** Compatibility driver for non-TTY callers; all decisions belong to core.
 * @param targets Resolved packages.
 * @param flags Completed arguments.
 * @param originCwd Scope origin.
 * @returns Core exit code after displaying its result.
 */
export async function renderPlain(targets: readonly ConsumerPackage[], flags: DefaultFlags, originCwd: string): Promise<number> {
  const result = await runInjection({ targets, flags, originCwd });
  displayPlain(result, Boolean(flags.force));
  return result.exitCode;
}

/** Display a completed model without planning, writes, or exit decisions.
 * @param result Core execution result.
 * @param force Whether the transcript should list force operations.
 */
export function displayPlain(result: RunResult, force: boolean): void {
  for (const error of result.errors) logger.error(error);
  for (const unit of result.units) {
    logger.heading(`${unit.target.name}@${unit.target.version} · ${unit.agentTarget.agent}`);
    logger.info(`${unit.target.name}@${unit.target.version} → ${unit.agentTarget.description}`);
    printPlan(unit.plan, unit.agentTarget);
    if (unit.error) logger.error(`${unit.target.name}: ${unit.error}`);
    if (unit.report?.exitCode === 2) logger.error('Re-run with --force to proceed, or inspect with --dry-run.');
    if (force) emitForceList(unit.plan);
    for (const path of unit.report?.updated ?? []) logger.file('update', path);
  }
  if (result.dryRun) logger.warn('[DRY RUN] No files will be created, overwritten, or deleted.');
}

function printPlan(plan: InjectPlan, agentTarget: AgentTarget): void {
  for (const action of plan.actions) {
    if (action.sourceHashReconciled)
      logger.warn(`source-hash-reconciled: ${action.relPath}`);
    const label = describe(action.relPath, action.target, agentTarget);
    if (action.kind === 'copy') logger.file('create', label);
    else if (action.kind === 'skip-uptodate')
      logger.file('skip', `${label} (up-to-date)`);
    else if (action.kind === 'skip-unsupported')
      logger.file(
        'skip',
        `${label} (${
          action.target.kind === 'unsupported'
            ? action.target.reason
            : 'unsupported'
        })`,
      );
    else if (action.kind === 'warn-diverged')
      logger.warn(
        `${label} — local differs from source (user edit or version change)`,
      );
    else if (action.kind === 'warn-orphan')
      logger.warn(`${label} — present locally, absent in source`);
    else if (action.kind === 'delete')
      logger.file('update', `${label} (deleting)`);
  }
}

// A block lives inside a document shared with other tools, so name that
// document — `rules/x.md` alone would read as a file this tool owns.
function describe(
  relPath: string,
  target: ActionTarget,
  agentTarget: AgentTarget,
): string {
  if (target.kind !== 'block') return relPath;
  const document = target.fileAbs.startsWith(agentTarget.projectRoot)
    ? target.fileAbs.slice(agentTarget.projectRoot.length + 1)
    : target.fileAbs;
  return `${document} ▸ ${relPath}`;
}

// Under --force an orphan is already planned as `delete`, so the list names
// deletions as well as overwrites: either one removes what the user had.
function emitForceList(plan: InjectPlan): void {
  const divergent = plan.actions.filter(
    (action) => action.kind === 'warn-diverged' || action.kind === 'delete',
  );
  if (divergent.length === 0) return;
  process.stderr.write(
    `[agents-assets-sync] --force overwriting or deleting ${divergent.length} entry(ies) in non-interactive mode:\n`,
  );
  for (const action of divergent) process.stderr.write(`  ${action.relPath}\n`);
}
