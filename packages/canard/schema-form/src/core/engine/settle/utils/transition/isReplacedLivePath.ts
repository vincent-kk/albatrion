import type { Optional } from '@aileron/declare';

import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Whether a whole replacement already gave this path's only raw to a live node.
 * @param context - Call whose replacement scope, virtual replace paths, or batch replace paths bound the covered paths
 * @param path - Absolute path of an exiting occurrence
 * @returns True when the path lies in a replaced scope and a live node holds it
 */
export const isReplacedLivePath = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): boolean => {
  const scope = context.replaceScope;
  const withinScope =
    scope !== undefined &&
    (!scope.path || path === scope.path || isDescendantPath(path, scope.path));
  let matchesVirtualReplacement: Optional<boolean> = undefined;

  const virtualReplacementPaths = context.virtualReplacePaths;
  if (virtualReplacementPaths != null) {
    matchesVirtualReplacement = false;
    for (
      let index = 0, count = virtualReplacementPaths.length;
      index < count;
      index++
    ) {
      const replaced = virtualReplacementPaths[index];

      if (path === replaced || isDescendantPath(path, replaced)) {
        matchesVirtualReplacement = true;
        break;
      }
    }
  }

  const withinVirtual = matchesVirtualReplacement ?? false;
  let matchesBatchReplacement: Optional<boolean> = undefined;

  const replacementPaths = context.replacePaths;
  if (replacementPaths != null) {
    matchesBatchReplacement = false;
    for (
      let index = 0, count = replacementPaths.length;
      index < count;
      index++
    ) {
      const replaced = replacementPaths[index];

      if (path === replaced || isDescendantPath(path, replaced)) {
        matchesBatchReplacement = true;
        break;
      }
    }
  }

  const withinBatch = matchesBatchReplacement ?? false;
  if (!withinScope && !withinVirtual && !withinBatch) return false;
  const live = find(context.root, path);
  return live !== null && !live.detached;
};
