import type { InjectEvent, TargetPlan, Warning } from '../types/index.js';

interface RequestForceConfirmInput {
  readonly plans: readonly TargetPlan[];
  readonly warnings: readonly Warning[];
  readonly force: boolean;
  readonly dispatch: (event: InjectEvent) => void;
}

export async function requestForceConfirm({
  plans,
  warnings,
  force,
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
