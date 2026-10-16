import { getItemEntries } from '../../../../blueprint';
import type { BlueprintNode } from '../../../../blueprint';
import { getBlueprintNodeIdentity } from '../../../../utils/nodeIdentity/getBlueprintNodeIdentity';

/**
 * Explore each failing template/depth state once within one path/token query.
 * @param node - Candidate template at the current occurrence depth
 * @param segments - Fixed decoded path for this query
 * @param depth - Next segment to consume; recursive calls strictly advance it
 * @param token - Fixed endpoint identity for this query
 * @param failed - Query-owned failed states, discarded when the query returns
 * @returns Whether a candidate path reaches the token; failed states are added on exhaustion
 */
export const visitLatentPath = (
  node: BlueprintNode,
  segments: readonly string[],
  depth: number,
  token: unknown,
  failed: Map<BlueprintNode, Set<number>>,
): boolean => {
  if (failed.get(node)?.has(depth)) return false;
  if (depth === segments.length) {
    if (getBlueprintNodeIdentity(node) === token) return true;
  } else if (node.strategy !== 'terminal') {
    const name = segments[depth];
    if (node.kind === 'array') {
      const index = Number(name);
      if (Number.isInteger(index) && index >= 0 && String(index) === name)
        for (const entry of getItemEntries(node, index))
          if (visitLatentPath(entry.node, segments, depth + 1, token, failed))
            return true;
    } else
      for (const entry of node.childEntries)
        if (
          entry.name === name &&
          visitLatentPath(entry.node, segments, depth + 1, token, failed)
        )
          return true;
  }
  let depths = failed.get(node);
  if (!depths) {
    depths = new Set();
    failed.set(node, depths);
  }
  depths.add(depth);
  return false;
};
