import type { Blueprint } from '../../types/blueprint';
import { endsWithBranchIndex } from './endsWithBranchIndex';

/** Direct union syntax anchors reference inheritance without inspecting resolved target names. */
const UNION_KEYWORDS = ['oneOf', 'anyOf'];

/**
 * Identify union branches and their same-host reference overlays.
 * @param blueprint - Finite graph whose fragment children retain expansion order.
 * @returns Fragment IDs with direct union warning eligibility.
 */
export const getUnionBranchFragmentIds = (
  blueprint: Blueprint,
): ReadonlySet<number> => {
  const ids = new Set<number>();
  for (const fragment of blueprint.fragments) {
    if (!endsWithBranchIndex(fragment.schemaPath, UNION_KEYWORDS)) continue;
    let current = fragment;
    while (!ids.has(current.id)) {
      ids.add(current.id);
      if (
        typeof current.schema !== 'object' ||
        current.schema === null ||
        typeof current.schema.$ref !== 'string'
      )
        break;
      const next = blueprint.fragments[current.children[0]];
      if (!next || next.order.length !== current.order.length) break;
      current = next;
    }
  }
  return ids;
};
