import { isWithin } from '../../../agentTarget/index.js';
import type { Action } from '../../../buildPlan/index.js';
import type { RunFailure, RunUnit } from './types.js';

/** Merge ownership from every participant before deciding any destructive action.
 * @param units Prepared units, retaining failed participants.
 * @param discoveryFailures Unknown owners rejected before preparation.
 * @param linkedDestinations Physical paths that share their file content with hard links.
 * @param resolveRoot Resolves the scope of a failed participant when an orphan needs protection.
 * @returns Plans with collisions refused and uncertain deletions recorded as notices.
 */
export async function mergePlans(
  units: readonly RunUnit[],
  discoveryFailures: readonly string[] = [],
  linkedDestinations: ReadonlyMap<string, string> = new Map(),
  resolveRoot?: (path: string) => Promise<string>,
): Promise<RunUnit[]> {
  const managed = new Set<string>();
  const contents = new Map<string, string>();
  const conflicts = new Set<string>();
  let hasFileOrphans = false;
  const contentKey = (path: string): string =>
    linkedDestinations.get(path) ?? path;
  for (const unit of units)
    for (const action of unit.plan.actions) {
      if (action.target.kind !== 'file') continue;
      if (isOrphan(action)) {
        hasFileOrphans = true;
        continue;
      }
      const key = destinationKey(action);
      managed.add(key);
      if (!action.sourceHash) continue;
      const storage = contentKey(key);
      const previous = contents.get(storage);
      if (previous !== undefined && previous !== action.sourceHash)
        conflicts.add(storage);
      contents.set(storage, action.sourceHash);
    }
  const refused = new Map<RunUnit, Action | undefined>();
  for (const unit of units) {
    const conflicting = conflicts.size
      ? unit.plan.actions.find((action) =>
          conflicts.has(contentKey(destinationKey(action))),
        )
      : undefined;
    if (unit.error || conflicting) refused.set(unit, conflicting);
  }
  const failed =
    hasFileOrphans && refused.size
      ? await Promise.all(
          [...refused.keys()].map(async (unit) => {
            const roots =
              unit.namespaceRoots ??
              Object.values(unit.agentTarget.directoryRoots).filter(
                (root) => root !== null,
              );
            return {
              unit,
              roots: resolveRoot ? await Promise.all(roots.map(resolveRoot)) : roots,
            };
          }),
        )
      : [];
  const owners = new Map<string, string>();
  return units.map((unit) => {
    const notices: RunFailure[] = [];
    const conflicting = refused.get(unit);
    const cannotApply = refused.has(unit);
    let requiresForce = false;
    const actions = unit.plan.actions.filter((action) => {
      if (cannotApply) return true;
      const key = destinationKey(action);
      if (isOrphan(action)) {
        if (action.target.kind === 'file' && managed.has(key)) return false;
        const noticeStart = notices.length;
        const path =
          action.target.kind === 'file'
            ? action.target.dstAbs
            : action.target.kind === 'block'
              ? action.target.fileAbs
              : action.relPath;
        for (const { unit: peer, roots } of failed) {
          if (
            action.target.kind !== 'file' ||
            !roots.some((root) => isWithin(root, key) || isWithin(root, path))
          ) continue;
          notices.push({
            unitKey: peer.key,
            path,
            stage: peer.error ? 'prepare' : 'merge',
            reason: `Deletion suppressed for ${peer.target.name}: ${peer.error ?? 'conflicting source contents'}`,
          });
        }
        for (const reason of discoveryFailures)
          notices.push({
            unitKey: 'discovery',
            path,
            stage: 'discover',
            reason: `Deletion suppressed: ${reason}`,
          });
        if (notices.length !== noticeStart) return false;
        requiresForce = true;
        return true;
      }
      if (action.target.kind === 'file' && action.sourceHash) {
        if (owners.has(key)) return false;
        owners.set(key, unit.key);
      }
      if (action.kind === 'warn-diverged') requiresForce = true;
      return true;
    });
    const reason = conflicting
      ? `Conflicting source contents: ${conflicting.relPath}`
      : undefined;
    const alias =
      !cannotApply && !actions.length
        ? unit.plan.actions.find(
            (action) => owners.get(destinationKey(action)) !== unit.key,
          )
        : undefined;
    return {
      ...unit,
      refused: cannotApply,
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
        requiresForce,
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
