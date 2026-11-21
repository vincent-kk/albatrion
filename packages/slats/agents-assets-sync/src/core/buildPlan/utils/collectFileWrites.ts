import type { InjectPlan } from '../type.js';

/**
 * List the destination files a plan copies or overwrites.
 *
 * Deletions and block writes are left out: an orphan comes from a walk that
 * never follows a link, and a block lives in a merge file checked as a root.
 *
 * @param plan - the plan about to be applied or previewed
 * @returns absolute destination paths of `copy` and `warn-diverged` file actions
 */
export function collectFileWrites(plan: InjectPlan): string[] {
  const paths: string[] = [];
  for (const action of plan.actions)
    if (
      (action.kind === 'copy' || action.kind === 'warn-diverged') &&
      action.target.kind === 'file'
    )
      paths.push(action.target.dstAbs);
  return paths;
}
