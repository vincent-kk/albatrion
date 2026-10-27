import type { BlueprintNode } from '../../types/node';

/** Template-lifetime absence proof; ordinary nodes acquire no field or cache entry. */
const literalWildcardNodes = new WeakSet<BlueprintNode>();

/** Record a direct or propagated literal-star binding while its template is built. */
export const markLiteralWildcardNode = (node: BlueprintNode): void => {
  literalWildcardNodes.add(node);
};

/** Test whether the finite template graph reaches an authored literal-star name. */
export const hasLiteralWildcardNode = (node: BlueprintNode): boolean =>
  literalWildcardNodes.has(node);
