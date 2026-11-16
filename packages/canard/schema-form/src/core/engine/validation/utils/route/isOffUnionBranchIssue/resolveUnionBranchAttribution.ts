import {
  filter as filterArray,
  map as mapArray,
} from '@winglet/common-utils/array';

import {
  JSONPointer as $,
  isDescendantPath,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { Blueprint, SchemaFragment } from '../../../../blueprint';

/** Static ownership of one validator schema location; live selection is not stored here. */
export interface UnionBranchAttribution {
  /** Unique nearest branch containing the issue owner. */
  owner: SchemaFragment;
  /** Alternative branches whose activity can prove the owner is inactive. */
  siblings: readonly SchemaFragment[];
}

/** A schema path ending in a `oneOf` or `anyOf` branch index. */
const UNION_BRANCH_FRAGMENT_PATH = /^.*\/(?:oneOf|anyOf)\/\d+$/;

/** A property key made only of digits, as a branch index. */
const NUMERIC_KEY = /^\d+$/;

/**
 * Resolve authored ownership without consulting any live occurrence.
 * @param schemaPath - Validator schema location already in the form pointer grammar.
 * @param blueprint - Immutable fragment graph, including reference targets.
 * @returns Unique conditional branch ownership, or null when attribution is uncertain.
 */
export const resolveUnionBranchAttribution = (
  schemaPath: string,
  blueprint: Blueprint,
): UnionBranchAttribution | null => {
  const matches = filterArray(
    blueprint.fragments,
    (fragment) =>
      schemaPath === fragment.schemaPath ||
      isDescendantPath(schemaPath, fragment.schemaPath),
  );
  if (!matches.length) return null;
  const longest = Math.max(
    ...mapArray(matches, (fragment) => fragment.schemaPath.length),
  );
  const owners = filterArray(
    matches,
    (fragment) => fragment.schemaPath.length === longest,
  );
  const branches: SchemaFragment[] = [];
  for (const fragment of blueprint.fragments) {
    if (!UNION_BRANCH_FRAGMENT_PATH.test(fragment.schemaPath)) continue;
    const pending = [fragment.id];
    const visited = new Set<number>();
    while (pending.length) {
      const id = pending.pop();
      if (id === undefined || visited.has(id)) continue;
      visited.add(id);
      pending.push(...blueprint.fragments[id].children);
    }
    let containsIssueOwner = false;
    for (let index = 0, count = owners.length; index < count; index++) {
      const owner = owners[index];

      if (visited.has(owner.id)) {
        containsIssueOwner = true;
        break;
      }
    }
    if (containsIssueOwner) {
      branches.push(fragment);
    }
  }
  if (!branches.length) return null;
  const nearest = Math.max(
    ...mapArray(branches, (fragment) => fragment.schemaPath.length),
  );
  const candidates = filterArray(
    branches,
    (fragment) => fragment.schemaPath.length === nearest,
  );
  if (candidates.length !== 1) return null;
  const owner = candidates[0];
  if (!owner.gates.length) return null;
  const unionPath = resolvePointer(owner.schemaPath, $.Parent);
  const siblings = filterArray(
    blueprint.fragments,
    (fragment) =>
      fragment.id !== owner.id &&
      NUMERIC_KEY.test(fragment.schemaPath.slice(unionPath.length + 1)) &&
      isDescendantPath(fragment.schemaPath, unionPath),
  );

  return { owner, siblings };
};
