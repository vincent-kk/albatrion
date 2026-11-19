import type { DefaultFlags } from '../../../../types/index.js';
import { asyncPool } from '../../../../utils/asyncPool.js';
import type { Action } from '../../../buildPlan/index.js';
import { applyAction } from '../applyAction.js';
import { applyBlockActions } from '../applyBlockActions.js';
import { partitionActions } from '../partitionActions.js';
import { summarize } from '../summarize.js';
import type { PreparedUnit, RunFailure, RunResult, RunUnit } from './types.js';
import { createRunDiagnostics } from './utils/createRunDiagnostics.js';

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
  diagnostics?: readonly RunFailure[],
): Promise<RunResult> {
  const results: RunUnit[] = [];
  for (const prepared of units) {
    const { ruleSources, ...metadata } = prepared;
    const unit: RunUnit = {
      ...metadata,
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
          [],
          flags.dryRun && !unit.error ? undefined : [],
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
    const diagnostics: RunFailure[] = fileActions.flatMap((action, index) => {
      const result = settled[index];
      return result.status === 'rejected'
        ? [
            {
              unitKey: unit.key,
              path:
                action.target.kind === 'file'
                  ? action.target.dstAbs
                  : action.relPath,
              stage: 'apply',
              reason: String(result.reason),
            },
          ]
        : [];
    });
    for (const [path, actions] of blockGroups) {
      try {
        await applyBlockActions(
          path,
          actions,
          unit.target.assetRoot,
          ruleSources,
        );
      } catch (error) {
        failures.push(...actions);
        diagnostics.push(
          ...actions.map((action) => ({
            unitKey: unit.key,
            path,
            stage: 'apply' as const,
            reason: `${action.relPath}: ${error instanceof Error ? error.message : String(error)}`,
          })),
        );
      }
    }
    results.push({
      ...unit,
      failures: diagnostics,
      ...(failures.length
        ? {
            error: diagnostics
              .map(
                (failure) =>
                  `${failure.path} [${failure.stage}]: ${failure.reason}`,
              )
              .join('\n'),
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
  return {
    units: results,
    errors,
    failures: [
      ...(diagnostics ?? createRunDiagnostics(errors, 'request')),
      ...results.flatMap((unit) => unit.failures ?? []),
    ],
    notices: results.flatMap((unit) => unit.notices ?? []),
    dryRun: Boolean(flags.dryRun),
    exitCode,
  };
}
