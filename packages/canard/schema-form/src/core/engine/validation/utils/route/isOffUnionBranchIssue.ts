import type { Blueprint, SchemaFragment } from '../../../blueprint';
import type { ValidationIssue } from '../../types/issue';
import {
  type UnionBranchAttribution,
  resolveUnionBranchAttribution,
} from './isOffUnionBranchIssue/resolveUnionBranchAttribution';

/**
 * Determine whether an issue belongs exclusively to an inactive union fragment.
 * @param issue - Validator issue with an authored schema location.
 * @param blueprint - Fragment ownership table, including reference targets.
 * @param isActive - Committed branch evidence scoped to the issue data occurrence.
 * @param attributions - Optional per-routing-pass ownership cache, bound to this blueprint.
 * @returns True only when attribution is unique and a sibling is active.
 */
export const isOffUnionBranchIssue = (
  issue: ValidationIssue,
  blueprint: Blueprint,
  isActive: (fragment: SchemaFragment) => boolean,
  attributions?: Map<string, UnionBranchAttribution | null>,
): boolean => {
  const path = issue.schemaPath;
  if (!path) return false;
  let attribution = attributions?.get(path);
  if (attribution === undefined) {
    attribution = resolveUnionBranchAttribution(path, blueprint);
    attributions?.set(path, attribution);
  }
  if (!attribution || isActive(attribution.owner)) return false;
  return attribution.siblings.some(isActive);
};
