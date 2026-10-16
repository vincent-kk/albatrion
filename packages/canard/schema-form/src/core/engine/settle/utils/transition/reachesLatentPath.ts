import type { BlueprintNode } from '../../../blueprint';
import { visitLatentPath } from './utils/visitLatentPath';

/**
 * Follow finite occurrence segments through reusable, possibly recursive templates.
 * @param node - Candidate template at the current occurrence depth
 * @param segments - Decoded descendant names relative to the candidate slot
 * @param depth - Next segment to consume; recursion always advances it
 * @param token - Existing path-unit identity token to match at the endpoint
 * @returns Whether an authored candidate path reaches the exact token; failed states
 * are retained only for this query and never shared with another token or path
 */
export const reachesLatentPath = (
  node: BlueprintNode,
  segments: readonly string[],
  depth: number,
  token: unknown,
): boolean =>
  visitLatentPath(
    node,
    segments,
    depth,
    token,
    new Map<BlueprintNode, Set<number>>(),
  );
