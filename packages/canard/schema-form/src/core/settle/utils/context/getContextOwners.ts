import type { Blueprint } from '../../../blueprint';
import { getDeriveRuleTable } from '../../derive';

/** Context readers are held apart from absolute JSON Pointer dependencies. */
const OWNERS = new WeakMap<Blueprint, readonly string[]>();
/** Shared result for blueprints without context reads. */
const EMPTY_OWNERS: readonly string[] = Object.freeze([]);

/**
 * Find declaration paths whose expressions or gates read the tree context token.
 * @param blueprint - Immutable analysis supplying declaration IDs and reads
 * @returns Memoized owner paths to recalculate when context changes
 */
export const getContextOwners = (blueprint: Blueprint): readonly string[] => {
  const cached = OWNERS.get(blueprint);
  if (cached) return cached;
  const ids = blueprint.dependencies['@'];
  if (!ids?.length) {
    OWNERS.set(blueprint, EMPTY_OWNERS);
    return EMPTY_OWNERS;
  }
  const owners: string[] = [];
  const rules = getDeriveRuleTable(blueprint);
  for (const node of blueprint.nodes)
    for (const declaration of node.declarations)
      if ((ids.includes(declaration.id) ||
        rules.byDeclaration.get(declaration.id)?.some((rule) =>
          rule.kind === 'derived' && rule.targetName &&
          rule.watchDependencies.includes('@'))) &&
        !owners.includes(declaration.path))
        owners.push(declaration.path);
  OWNERS.set(blueprint, owners);
  return owners;
};
