import { find } from '../../../navigation';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Whether a whole replacement already gave this path's only raw to a live node.
 * @param context - Call whose replacement scope bounds the covered paths
 * @param path - Absolute path of an exiting occurrence
 * @returns True when the path lies in the replaced scope and a live node holds it
 */
export const isReplacedLivePath = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, path: string,
): boolean => {
  const scope = context.replaceScope;
  if (!scope) return false;
  if (scope.path && path !== scope.path && !path.startsWith(`${scope.path}/`))
    return false;
  const live = find(context.root, path);
  return live !== null && !live.detached;
};
