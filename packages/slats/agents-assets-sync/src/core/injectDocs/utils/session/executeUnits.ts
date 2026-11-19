import type { DefaultFlags } from '../../../../types/index.js';
import { asyncPool } from '../../../../utils/asyncPool.js';
import type { Action } from '../../../buildPlan/index.js';
import { applyAction } from '../applyAction.js';
import { applyBlockActions } from '../applyBlockActions.js';
import { partitionActions } from '../partitionActions.js';
import { summarize } from '../summarize.js';
import type { PreparedUnit, RunResult, RunUnit } from './types.js';

/** Apply prepared units once, then return the complete result model.
 * @param units Read-only plans.
 * @param flags Completed options.
 * @param errors Diagnostics collected before planning.
 * @param cancelled Whether confirmation was refused.
 * @returns Successful operations and failures with their final exit code.
 */
export async function executeUnits(
  units: readonly PreparedUnit[],
  flags: DefaultFlags,
  errors: readonly string[],
  cancelled = false,
): Promise<RunResult> {
  const results: RunUnit[] = [];
  for (const prepared of units) {
    const unit: RunUnit = {
      ...prepared,
      key:
        prepared.key ?? `${prepared.agentTarget.agent}:${prepared.target.name}`,
    };
    const blocked = unit.plan.requiresForce && !flags.force && !flags.dryRun;
    if (unit.error || blocked || flags.dryRun || cancelled) {
      results.push({
        ...unit,
        report: summarize(
          unit.plan,
          unit.error ? 1 : blocked || cancelled ? 2 : 0,
        ),
      });
      continue;
    }
    const { fileActions, blockGroups } = partitionActions(
      unit.plan.actions,
      Boolean(flags.force),
    );
    const settled = await asyncPool(8, fileActions, (action) =>
      applyAction(action, unit.target.assetRoot),
    );
    const failures: Action[] = fileActions.filter(
      (_, index) => settled[index].status === 'rejected',
    );
    for (const [path, actions] of blockGroups) {
      try {
        await applyBlockActions(path, actions, unit.target.assetRoot);
      } catch {
        failures.push(...actions);
      }
    }
    results.push({
      ...unit,
      ...(failures.length
        ? {
            error: `Failed to apply: ${failures.map((action) => action.relPath).join(', ')}`,
          }
        : {}),
      report: summarize(unit.plan, failures.length ? 1 : 0, failures, [
        ...fileActions,
        ...[...blockGroups.values()].flat(),
      ]),
    });
  }
  const exitCode = results.some((unit) => unit.report?.exitCode === 1)
    ? 1
    : cancelled || results.some((unit) => unit.report?.exitCode === 2)
      ? 2
      : 0;
  return { units: results, errors, dryRun: Boolean(flags.dryRun), exitCode };
}
