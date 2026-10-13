import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

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
    (!scope.path || path === scope.path || path.startsWith(`${scope.path}/`));
  const withinVirtual =
    context.virtualReplacePaths?.some(
      (replaced) => path === replaced || path.startsWith(`${replaced}/`),
    ) ?? false;
  const withinBatch =
    context.replacePaths?.some(
      (replaced) => path === replaced || path.startsWith(`${replaced}/`),
    ) ?? false;
  if (!withinScope && !withinVirtual && !withinBatch) return false;
  const live = find(context.root, path);
  return live !== null && !live.detached;
};
