import type { InjectPlan } from '../../buildPlan/index.js';
import type { InjectReport } from '../type.js';

export function summarize(plan: InjectPlan, exitCode: 0 | 1 | 2): InjectReport {
  const report: InjectReport = {
    created: [],
    updated: [],
    skipped: [],
    warnings: [],
    deleted: [],
    exitCode,
  };
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
