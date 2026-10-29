import {
  filter as filterArray,
  map as mapArray,
} from '@winglet/common-utils/array';

import {
  JSONPointer as $,
  isDescendantPath,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { Blueprint, SchemaFragment } from '../../../blueprint';
import type { ValidationIssue } from '../../types/issue';

/** A schema path ending in a `oneOf` or `anyOf` branch index. */
const UNION_BRANCH_FRAGMENT_PATH = /^.*\/(?:oneOf|anyOf)\/\d+$/;

/** A property key made only of digits, as a branch index. */
const NUMERIC_KEY = /^\d+$/;

/**
 * Determine whether an issue belongs exclusively to an inactive union fragment.
 * @param issue - Validator issue with an authored schema location.
 * @param blueprint - Fragment ownership table, including reference targets.
 * @param activeIds - Committed declaration identities collected once per routing pass.
 * @returns True only when attribution is unique and a sibling is active.
 */
export const isOffUnionBranchIssue = (
  issue: ValidationIssue,
  blueprint: Blueprint,
  activeIds?: ReadonlySet<number>,
): boolean => {
  if (!issue.schemaPath || !activeIds) return false;
  const matches = filterArray(
    blueprint.fragments,
    (fragment) =>
      issue.schemaPath === fragment.schemaPath ||
      (issue.schemaPath !== undefined &&
        isDescendantPath(issue.schemaPath, fragment.schemaPath)),
  );
  if (!matches.length) return false;
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
    let hasMatch = false;
    for (let index = 0, count = owners.length; index < count; index++) {
      const owner = owners[index];

      if (visited.has(owner.id)) {
        hasMatch = true;
        break;
      }
    }
    if (hasMatch) {
      branches.push(fragment);
    }
  }
  if (!branches.length) return false;
  const nearest = Math.max(
    ...mapArray(branches, (fragment) => fragment.schemaPath.length),
  );
  const candidates = filterArray(
    branches,
    (fragment) => fragment.schemaPath.length === nearest,
  );
  if (candidates.length !== 1) return false;
  const owner = candidates[0];
  if (!owner.gates.length) return false;
  const unionPath = resolvePointer(owner.schemaPath, $.Parent);
  const siblings = filterArray(
    blueprint.fragments,
    (fragment) =>
      fragment.id !== owner.id &&
      NUMERIC_KEY.test(fragment.schemaPath.slice(unionPath.length + 1)) &&
      isDescendantPath(fragment.schemaPath, unionPath),
  );

  const isActive = (fragment: SchemaFragment): boolean => {
    let hasMatch2 = false;
    for (const id of fragment.declares) {
      if (activeIds.has(id)) {
        hasMatch2 = true;
        break;
      }
    }
    let matchesEither = hasMatch2;
    if (!matchesEither) {
      matchesEither = false;
      for (const id of fragment.overlays) {
        if (activeIds.has(id)) {
          matchesEither = true;
          break;
        }
      }
    }
    return matchesEither;
  };
  let matches2 = !isActive(owner);
  if (matches2) {
    matches2 = false;
    for (let index = 0, count = siblings.length; index < count; index++) {
      const item = siblings[index];

      if (isActive(item)) {
        matches2 = true;
        break;
      }
    }
  }
  return matches2;
};
