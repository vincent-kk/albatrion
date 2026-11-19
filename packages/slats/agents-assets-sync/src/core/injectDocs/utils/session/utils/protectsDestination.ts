import { sep } from 'node:path';

import type { Action } from '../../../../buildPlan/index.js';
import type { RunUnit } from '../types.js';

/** Decide ownership uncertainty from the same known roots used by planning.
 * @param unit Failed participant with known namespaces or an unknown whole root.
 * @param action Orphan candidate whose physical and displayed paths are preserved.
 * @returns Whether this participant can own the file being considered for deletion.
 */
export function protectsDestination(unit: RunUnit, action: Action): boolean {
  if (action.target.kind !== 'file') return false;
  const { dstAbs } = action.target;
  const key = action.destinationKey ?? dstAbs;
  const roots =
    unit.namespaceRoots ??
    Object.values(unit.agentTarget.directoryRoots).filter(
      (root): root is string => root !== null,
    );
  return roots.some(
    (root) =>
      key === root ||
      key.startsWith(root + sep) ||
      dstAbs.startsWith(root + sep),
  );
}
