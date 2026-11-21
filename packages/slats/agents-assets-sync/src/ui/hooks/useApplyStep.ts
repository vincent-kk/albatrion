import type { Fn } from '@aileron/declare';

import { type InjectReport, executeUnits } from '../../core/index.js';
import type { InjectEvent, TargetPlan } from '../types/index.js';

interface ApplyStepInput {
  readonly plans: readonly TargetPlan[];
  readonly dryRun: boolean;
  readonly force: boolean;
  readonly dispatch: Fn<[event: InjectEvent]>;
}

/** Compatibility apply transport; all writes and exit decisions stay in core.
 * @param input Prepared plans and display transport.
 * @returns Core reports and exit status.
 */
export async function applyAllPlans({
  plans,
  dryRun,
  force,
  dispatch,
}: ApplyStepInput): Promise<{ reports: InjectReport[]; exitCode: 0 | 1 | 2 }> {
  const result = await executeUnits(plans, { dryRun, force }, []);
  const reports = result.units.flatMap((unit) =>
    unit.report ? [unit.report] : [],
  );
  dispatch({ type: 'done', reports, exitCode: result.exitCode, dryRun });
  return { reports, exitCode: result.exitCode };
}
