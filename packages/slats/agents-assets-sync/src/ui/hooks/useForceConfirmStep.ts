import type { InjectEvent, TargetPlan, Warning } from '../types/index.js';

interface RequestForceConfirmInput {
  readonly plans: readonly TargetPlan[];
  readonly warnings: readonly Warning[];
  readonly force: boolean;
  /** `--yes`: approve without showing the dialog. */
  readonly autoApprove: boolean;
  readonly dispatch: (event: InjectEvent) => void;
}

/**
 * Gate the apply step behind `--force` and, unless `--yes` was passed, an
 * explicit confirmation.
 *
 * @returns `true` when applying may proceed
 */
export async function requestForceConfirm({
  plans,
  warnings,
  force,
  autoApprove,
  dispatch,
}: RequestForceConfirmInput): Promise<boolean> {
  const hasWarnings = plans.some((p) => p.plan.requiresForce);
  if (!hasWarnings) return true;
  if (!force) {
    dispatch({
      type: 'fail',
      error: new Error(
        'Re-run with --force to proceed, or inspect with --dry-run.',
      ),
    });
    return false;
  }
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
