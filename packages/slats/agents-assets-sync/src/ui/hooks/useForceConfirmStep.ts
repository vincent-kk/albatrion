import type { Fn } from '@aileron/declare';

import type { InjectEvent, TargetPlan, Warning } from '../types/index.js';

interface RequestForceConfirmInput {
  readonly plans: readonly TargetPlan[];
  readonly warnings: readonly Warning[];
  readonly force: boolean;
  /** `--yes`: approve without showing the dialog. */
  readonly autoApprove: boolean;
  /** `--dry-run`: nothing is written, so there is nothing to gate. */
  readonly dryRun: boolean;
  readonly dispatch: Fn<[event: InjectEvent]>;
}

/**
 * Gate the apply step behind `--force` and, unless `--yes` was passed, an
 * explicit confirmation. A dry run passes the gate, since it writes nothing.
 *
 * @returns `true` when applying may proceed
 */
export async function requestForceConfirm({
  plans,
  warnings,
  force,
  autoApprove,
  dryRun,
  dispatch,
}: RequestForceConfirmInput): Promise<boolean> {
  const hasWarnings = plans.some((p) => p.plan.requiresForce);
  if (!hasWarnings || dryRun) return true;
  if (!force) return true;
  // No dialog is shown, so no phase transition is needed: `applyAllPlans`
  // moves on from `diff-review` with its own `apply-start`.
  if (autoApprove) return true;
  return new Promise<boolean>((resolve) => {
    dispatch({
      type: 'force-confirm-required',
      warnings,
      pending: (ok) => {
        dispatch({ type: 'force-answer', ok });
        resolve(ok);
      },
    });
  });
}
