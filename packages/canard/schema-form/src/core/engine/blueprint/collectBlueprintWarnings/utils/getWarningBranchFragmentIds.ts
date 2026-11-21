import type { Blueprint } from '../../types/blueprint';
import { endsWithBranchIndex } from './endsWithBranchIndex';

/** Direct branch syntax determines which warning eligibility follows a reference overlay. */
const UNION_KEYWORDS = ['oneOf', 'anyOf'];
/** Conjunctive branches carry unsupported-keyword warnings. */
const ALL_OF_KEYWORDS = ['allOf'];

/**
 * Index warning scopes in one fragment traversal without crossing into child hosts.
 * @param blueprint - Finite graph whose reference overlays retain their parent's order.
 * @returns Separate union and allOf fragment identities, including their reference chains.
 */
export const getWarningBranchFragmentIds = (blueprint: Blueprint) => {
  const union = new Set<number>();
  const allOf = new Set<number>();
  for (const fragment of blueprint.fragments) {
    const ids = endsWithBranchIndex(fragment.schemaPath, ALL_OF_KEYWORDS)
      ? allOf
      : endsWithBranchIndex(fragment.schemaPath, UNION_KEYWORDS)
        ? union
        : undefined;
    if (!ids) continue;
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
  return { union, allOf };
};
