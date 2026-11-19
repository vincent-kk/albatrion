import type { Action, InjectPlan } from '../../buildPlan/index.js';
import type { InjectReport } from '../type.js';

/**
 * Aggregate a plan into the report renderers print and the process exits on.
 *
 * Pure — the plan already carries every verdict, so no filesystem or
 * environment is consulted here.
 *
 * @param plan - the plan whose actions were applied, or previewed
 * @param exitCode - code the caller decided on for this target
 * @param failedActions - attempted actions that failed and must not count as applied
 * @param appliedActions - submitted actions; omitted previews the plan, empty means none applied
 * @returns per-category path lists plus the exit code
 */
export function summarize(
  plan: InjectPlan,
  exitCode: 0 | 1 | 2,
  failedActions: readonly Action[] = [],
  appliedActions?: readonly Action[],
): InjectReport {
  const failed = new Set(failedActions);
  const applied =
    appliedActions === undefined ? undefined : new Set(appliedActions);
  const report: InjectReport = {
    created: [],
    updated: [],
    skipped: [],
    warnings: [],
    deleted: [],
    exitCode,
  };
  for (const action of plan.actions) {
    if (action.sourceHashReconciled)
      report.warnings.push({
        relPath: action.relPath,
        reason: 'source-hash-reconciled',
      });
    if (failed.has(action)) {
      report.warnings.push({ relPath: action.relPath, reason: 'failed' });
      continue;
    }
    if (action.kind === 'copy') {
      if (applied === undefined || applied.has(action))
        report.created.push(action.relPath);
    } else if (action.kind === 'skip-uptodate')
      report.skipped.push(action.relPath);
    else if (action.kind === 'skip-unsupported')
      report.skipped.push(action.relPath);
    else if (action.kind === 'warn-diverged') {
      if (applied?.has(action)) report.updated.push(action.relPath);
      else
        report.warnings.push({ relPath: action.relPath, reason: 'diverged' });
    } else if (action.kind === 'warn-orphan')
      report.warnings.push({ relPath: action.relPath, reason: 'orphan' });
    else if (
      action.kind === 'delete' &&
      (applied === undefined || applied.has(action))
    )
      report.deleted.push(action.relPath);
  }
  return report;
}
