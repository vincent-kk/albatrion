import type { RunUnit } from './types.js';

/** Merge the run-wide namespace without changing source ownership.
 * @param units All prepared units, before any write.
 * @returns Plans that protect every participating package's managed files.
 */
export function mergePlans(units: readonly RunUnit[]): RunUnit[] {
  const managed = new Set<string>();
  for (const unit of units) for (const action of unit.plan.actions)
    if (action.target.kind === 'file' && action.kind !== 'delete' && action.kind !== 'warn-orphan') managed.add(action.target.dstAbs);
  return units.map(unit => {
    const actions = unit.plan.actions.filter(action =>
      !((action.kind === 'delete' || action.kind === 'warn-orphan') && action.target.kind === 'file' && managed.has(action.target.dstAbs)));
    return { ...unit, plan: { actions, requiresForce: actions.some(action => action.kind === 'warn-diverged' || action.kind === 'warn-orphan' || action.kind === 'delete') } };
  });
}
