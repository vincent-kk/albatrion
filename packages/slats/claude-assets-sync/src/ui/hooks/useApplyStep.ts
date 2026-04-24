import { applyAction, summarize } from '../../core/injectDocs/index.js';
import type { InjectReport } from '../../core/index.js';
import { asyncPool } from '../../utils/asyncPool.js';
import type { InjectEvent, TargetPlan } from '../types/index.js';

interface ApplyStepInput {
  readonly plans: readonly TargetPlan[];
  readonly dryRun: boolean;
  readonly dispatch: (event: InjectEvent) => void;
}

const CONCURRENCY = 8;

export async function applyAllPlans({
  plans,
  dryRun,
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
    await asyncPool(CONCURRENCY, tp.plan.actions, async (action) => {
      await applyAction(action, tp.target.assetRoot);
      done += 1;
      dispatch({ type: 'apply-progress', done, current: action.relPath });
    });
    reports.push(summarize(tp.plan, 0));
  }

  const hasFailure = reports.some((r) => r.exitCode !== 0);
  const exitCode: 0 | 1 | 2 = hasFailure ? 1 : 0;
  dispatch({ type: 'done', reports, exitCode, dryRun: false });
  return { reports, exitCode };
}
