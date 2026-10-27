import type { TreeMemoStores } from '../../types/treeMemoStores';
import { encodeNodeKey } from '../nodeIdentity/encodeNodeKey';
import { getBlueprintNodeIdentity } from '../nodeIdentity/getBlueprintNodeIdentity';

/**
 * Reuse the exact path/fold-inclusive-kind pair identity until an occurrence is reindexed.
 * @param node - Declaration target with an absolute path and immutable fold-inclusive kind
 * @param runtime - Root owner of this occurrence memo or retained address state
 * @returns JSON pair key compatible with committed path-store moves
 */
export const getCommittedDeclarationKey = (
  node: {
    readonly path: string;
    readonly blueprintNode: Parameters<typeof getBlueprintNodeIdentity>[0];
  },
  runtime: Pick<TreeMemoStores, 'committedDeclarationKeys'>,
): string => {
  const path = node.path;
  const cached = runtime.committedDeclarationKeys?.get(node);
  const kind =
    node.blueprintNode.kind === 'union'
      ? getBlueprintNodeIdentity(node.blueprintNode)
      : node.blueprintNode.kind;
  if (cached?.path === path && cached.kind === kind) return cached.key;
  const key = encodeNodeKey(path, kind);
  (runtime.committedDeclarationKeys ??= new WeakMap()).set(node, {
    path,
    kind,
    key,
  });
  return key;
};
