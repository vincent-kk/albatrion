import type { Blueprint, SchemaFragment } from '../../../blueprint';
import type { ValidationIssue } from '../../type';

/**
 * Determine whether an issue belongs exclusively to an inactive union fragment.
 * @param issue - Validator issue with an authored schema location.
 * @param blueprint - Fragment ownership table, including reference targets.
 * @param activeIds - Committed declaration identities collected once per routing pass.
 * @returns True only when attribution is unique and a sibling is active.
 */
export const isOffUnionBranchIssue = (
  issue: ValidationIssue, blueprint: Blueprint,
  activeIds?: ReadonlySet<number>,
): boolean => {
  if (!issue.schemaPath || !activeIds) return false;
  const matches = blueprint.fragments.filter((fragment) =>
    issue.schemaPath === fragment.schemaPath ||
    issue.schemaPath?.startsWith(`${fragment.schemaPath}/`));
  if (!matches.length) return false;
  const longest = Math.max(...matches.map((fragment) => fragment.schemaPath.length));
  const owners = matches.filter((fragment) => fragment.schemaPath.length === longest);
  const branches: SchemaFragment[] = [];
  for (const fragment of blueprint.fragments) {
    if (!/^.*\/(?:oneOf|anyOf)\/\d+$/.test(fragment.schemaPath)) continue;
    const pending = [fragment.id];
    const visited = new Set<number>();
    while (pending.length) {
      const id = pending.pop();
      if (id === undefined || visited.has(id)) continue;
      visited.add(id);
      pending.push(...blueprint.fragments[id].children);
    }
    if (owners.some((owner) => visited.has(owner.id))) branches.push(fragment);
  }
  if (!branches.length) return false;
  const nearest = Math.max(...branches.map((fragment) => fragment.schemaPath.length));
  const candidates = branches.filter((fragment) => fragment.schemaPath.length === nearest);
  if (candidates.length !== 1) return false;
  const owner = candidates[0];
  if (!owner.gates.length) return false;
  const unionPath = owner.schemaPath.slice(0, owner.schemaPath.lastIndexOf('/'));
  const siblings = blueprint.fragments.filter((fragment) =>
    fragment.id !== owner.id &&
    /^\d+$/.test(fragment.schemaPath.slice(unionPath.length + 1)) &&
    fragment.schemaPath.startsWith(`${unionPath}/`));
  const isActive = (fragment: SchemaFragment): boolean =>
    fragment.declares.some((id) => activeIds.has(id)) ||
    fragment.overlays.some((id) => activeIds.has(id));
  return !isActive(owner) && siblings.some(isActive);
};
