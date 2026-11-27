import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { readWriteCoverage } from '../write/readWriteCoverage';

/**
 * Whether a whole replacement already gave this path's only source to a live node.
 * @param context - Call whose replacement scope, virtual replace paths, or batch replace paths bound the covered paths
 * @param path - Absolute path of an exiting occurrence
 * @returns True when the path lies in a replaced scope and a live node holds it
 */
export const isReplacedLivePath = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): boolean => {
  const scope = context.replacementScope;
  const withinScope =
    scope !== undefined &&
    (!scope.path || path === scope.path || isDescendantPath(path, scope.path));
  if (
    !withinScope &&
    !context.virtualReplacementPaths?.some(
      (replaced) => path === replaced || isDescendantPath(path, replaced),
    ) &&
    !(
      context.writeOrigins &&
      readWriteCoverage(context.writeOrigins, path, 'whole')
    )
  )
    return false;
  const live = find(context.root, path);
  return live !== null && !live.isDetached;
};
