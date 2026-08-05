import type { InjectPlan } from '../../buildPlan/index.js';
import type { InjectReport } from '../type.js';

/**
 * Aggregate a plan into the report renderers print and the process exits on.
 *
 * Pure — the plan already carries every verdict, so no filesystem or
 * environment is consulted here.
 *
 * @param plan - the plan whose actions were applied, or previewed
 * @param exitCode - code the caller decided on for this target
 * @returns per-category path lists plus the exit code
 */
export function summarize(plan: InjectPlan, exitCode: 0 | 1 | 2): InjectReport {
  const report: InjectReport = {
    created: [],
    updated: [],
    skipped: [],
    warnings: [],
    deleted: [],
    exitCode,
  };
  for (const action of plan.actions) {
    if (action.kind === 'copy') report.created.push(action.relPath);
    else if (action.kind === 'skip-uptodate') report.skipped.push(action.relPath);
    else if (action.kind === 'skip-unsupported')
      report.skipped.push(action.relPath);
    else if (action.kind === 'warn-diverged')
      report.warnings.push({ relPath: action.relPath, reason: 'diverged' });
    else if (action.kind === 'warn-orphan')
      report.warnings.push({ relPath: action.relPath, reason: 'orphan' });
    else if (action.kind === 'delete') report.deleted.push(action.relPath);
  }
  return report;
}
