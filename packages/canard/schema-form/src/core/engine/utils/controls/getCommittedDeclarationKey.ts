import { getBlueprintNodeIdentity } from '../nodeIdentity/getBlueprintNodeIdentity';

/** Last serialized identity for a live or latent declaration target. */
const KEYS = new WeakMap<
  object,
  {
    path: string;
    kind: string;
    key: string;
  }
>();

/**
 * Reuse the exact path/fold-inclusive-kind pair identity until an occurrence is reindexed.
 * @param node - Declaration target with an absolute path and immutable fold-inclusive kind
 * @returns JSON pair key compatible with committed path-store moves
 */
export const getCommittedDeclarationKey = (node: {
  readonly path: string;
  readonly blueprintNode: Parameters<typeof getBlueprintNodeIdentity>[0];
}): string => {
  const path = node.path;
  const kind = getBlueprintNodeIdentity(node.blueprintNode);
  const cached = KEYS.get(node);
  if (cached?.path === path && cached.kind === kind) return cached.key;
  const key = JSON.stringify([path, kind]);
  KEYS.set(node, { path, kind, key });
  return key;
};
