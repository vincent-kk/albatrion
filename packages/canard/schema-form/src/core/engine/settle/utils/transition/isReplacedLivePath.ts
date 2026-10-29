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
  let hasMatch: Optional<boolean> = undefined;
  {
    const items = context.virtualReplacePaths;
    if (items != null) {
      hasMatch = false;
      for (let index = 0, count = items.length; index < count; index++) {
        const replaced = items[index];

        if (path === replaced || isDescendantPath(path, replaced)) {
          hasMatch = true;
          break;
        }
      }
    }
  }
  const withinVirtual = hasMatch ?? false;
  let hasMatch2: Optional<boolean> = undefined;
  {
    const items = context.replacePaths;
    if (items != null) {
      hasMatch2 = false;
      for (let index = 0, count = items.length; index < count; index++) {
        const replaced = items[index];

        if (path === replaced || isDescendantPath(path, replaced)) {
          hasMatch2 = true;
          break;
        }
      }
    }
  }
  const withinBatch = hasMatch2 ?? false;
  if (!withinScope && !withinVirtual && !withinBatch) return false;
  const live = find(context.root, path);
  return live !== null && !live.detached;
};
