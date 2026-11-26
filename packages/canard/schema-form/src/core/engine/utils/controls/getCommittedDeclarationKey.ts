import type { CommittedDeclarationKey } from '../../types/controls';
import { getBlueprintNodeIdentity } from '../nodeIdentity/getBlueprintNodeIdentity';

/**
 * Reuse the exact path/fold-inclusive-kind pair identity until an occurrence is reindexed.
 * @param node - Declaration target with an absolute path and immutable fold-inclusive kind; its `__declarationKey__` holds the reused key
 * @returns JSON pair key compatible with committed path-store moves
 */
export const getCommittedDeclarationKey = (node: {
  readonly path: string;
  readonly blueprintNode: Parameters<typeof getBlueprintNodeIdentity>[0];
  __declarationKey__?: CommittedDeclarationKey;
}): string => {
  const path = node.path;
  const kind = getBlueprintNodeIdentity(node.blueprintNode);
  const cached = node.__declarationKey__;
  if (cached?.path === path && cached.kind === kind) return cached.key;
  const key = JSON.stringify([path, kind]);
  node.__declarationKey__ = { path, kind, key };
  return key;
};
