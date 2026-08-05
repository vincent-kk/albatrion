import {
  type InjectReport,
  applyAction,
  applyBlockActions,
  partitionActions,
  summarize,
} from '../../core/index.js';
import { asyncPool } from '../../utils/asyncPool.js';
import type { InjectEvent, TargetPlan } from '../types/index.js';

interface ApplyStepInput {
  readonly plans: readonly TargetPlan[];
  readonly dryRun: boolean;
  readonly force: boolean;
  readonly dispatch: (event: InjectEvent) => void;
}

const CONCURRENCY = 8;

/**
 * Execute every plan, then report.
 *
 * File copies run through a pool; block writes are applied one document at a
 * time, because concurrent writers to a shared `AGENTS.md` would each persist
 * their own read of it and only the last would survive.
 *
 * @returns the reports and the exit code the app should resolve with
 */
export async function applyAllPlans({
  plans,
  dryRun,
  force,
  dispatch,
}: ApplyStepInput): Promise<{
  reports: InjectReport[];
  exitCode: 0 | 1 | 2;
}> {
  const total = plans.reduce((acc, tp) => acc + tp.plan.actions.length, 0);
  let done = 0;
  dispatch({ type: 'apply-start', total });

  if (dryRun) {
    const reports = plans.map((tp) => summarize(tp.plan, 0));
    dispatch({ type: 'done', reports, exitCode: 0, dryRun: true });
    return { reports, exitCode: 0 };
  }

  const reports: InjectReport[] = [];
  for (const tp of plans) {
    const { fileActions, blockGroups } = partitionActions(
      tp.plan.actions,
      force,
    );
    await asyncPool(CONCURRENCY, fileActions, async (action) => {
      await applyAction(action, tp.target.assetRoot);
      done += 1;
      dispatch({ type: 'apply-progress', done, current: action.relPath });
    });
    for (const [fileAbs, group] of blockGroups) {
      await applyBlockActions(fileAbs, group, tp.target.assetRoot);
      done += group.length;
      dispatch({ type: 'apply-progress', done, current: fileAbs });
    }
    reports.push(summarize(tp.plan, 0));
  }

  const hasFailure = reports.some((r) => r.exitCode !== 0);
  const exitCode: 0 | 1 | 2 = hasFailure ? 1 : 0;
  dispatch({ type: 'done', reports, exitCode, dryRun: false });
  return { reports, exitCode };
}
