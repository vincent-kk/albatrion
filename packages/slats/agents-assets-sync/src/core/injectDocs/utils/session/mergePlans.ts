import { sep } from 'node:path';

import type { Action } from '../../../buildPlan/index.js';
import type { RunFailure, RunUnit } from './types.js';

/** Merge ownership from every participant before deciding any destructive action.
 * @param units Prepared units, retaining failed participants.
 * @param discoveryFailures Unknown owners rejected before preparation.
 * @returns Plans with collisions refused and uncertain deletions recorded as notices.
 */
export function mergePlans(
  units: readonly RunUnit[],
  discoveryFailures: readonly string[] = [],
): RunUnit[] {
  const managed = new Set<string>();
  const contents = new Map<string, string>();
  const conflicts = new Set<string>();
  for (const unit of units)
    for (const action of unit.plan.actions) {
      if (action.target.kind !== 'file' || isOrphan(action)) continue;
      const key = destinationKey(action);
      managed.add(key);
      if (!action.sourceHash) continue;
      const previous = contents.get(key);
      if (previous !== undefined && previous !== action.sourceHash)
        conflicts.add(key);
      contents.set(key, action.sourceHash);
    }
  const failedUnits = units.filter(
    (unit) =>
      unit.error ||
      unit.plan.actions.some((action) => conflicts.has(destinationKey(action))),
  );
  const failedRoots = (discoveryFailures.length ? units : failedUnits).flatMap(
    (unit) => [
      ...(unit.namespaceRoots ?? []),
      ...Object.values(unit.agentTarget.directoryRoots).filter(
        (root): root is string => root !== null,
      ),
    ],
  );
  const owners = new Map<string, string>();
  return units.map((unit) => {
    const notices: RunFailure[] = [];
    const conflicting = unit.plan.actions.find((action) =>
      conflicts.has(destinationKey(action)),
    );
    const actions = unit.plan.actions.filter((action) => {
      if (unit.error || conflicting || action.target.kind !== 'file')
        return true;
      const key = destinationKey(action);
      if (isOrphan(action)) {
        if (managed.has(key)) return false;
        if (
          !failedRoots.some(
            (root) =>
              key === root ||
              key.startsWith(root + sep) ||
              (action.target.kind === 'file' &&
                action.target.dstAbs.startsWith(root + sep)),
          )
        )
          return true;
        for (const peer of failedUnits)
          notices.push({
            unitKey: peer.key,
            path: action.target.dstAbs,
            stage: peer.error ? 'prepare' : 'merge',
            reason: `Deletion suppressed for ${peer.target.name}: ${peer.error ?? 'conflicting source contents'}`,
          });
        for (const reason of discoveryFailures)
          notices.push({
            unitKey: 'discovery',
            path: action.target.dstAbs,
            stage: 'discover',
            reason: `Deletion suppressed: ${reason}`,
          });
        return false;
      }
      if (unit.error || conflicting || !action.sourceHash) return true;
      if (owners.has(key)) return false;
      owners.set(key, unit.key);
      return true;
    });
    const reason = conflicting
      ? `Conflicting source contents: ${conflicting.relPath}`
      : undefined;
    const alias =
      !unit.error && !conflicting && !actions.length
        ? unit.plan.actions.find(
            (action) => owners.get(destinationKey(action)) !== unit.key,
          )
        : undefined;
    return {
      ...unit,
      refused: Boolean(unit.error || conflicting),
      ...(alias ? { aliasOf: owners.get(destinationKey(alias)) } : {}),
      notices,
      ...(reason && conflicting
        ? {
            error: reason,
            failures: [
              {
                unitKey: unit.key,
                path:
                  conflicting.target.kind === 'file'
                    ? conflicting.target.dstAbs
                    : conflicting.relPath,
                stage: 'merge' as const,
                reason,
              },
            ],
          }
        : {}),
      plan: {
        actions,
        requiresForce:
          !unit.error &&
          !conflicting &&
          actions.some(
            (action) => action.kind === 'warn-diverged' || isOrphan(action),
          ),
      },
    };
  });
}

/** Read the physical destination when prepared, otherwise its declared spelling. */
function destinationKey(action: Action): string {
  return (
    action.destinationKey ??
    (action.target.kind === 'file' ? action.target.dstAbs : '')
  );
}

/** Identify destructive or force-pending orphan work without treating overwrites as deletion. */
function isOrphan(action: Action): boolean {
  return action.kind === 'delete' || action.kind === 'warn-orphan';
}
