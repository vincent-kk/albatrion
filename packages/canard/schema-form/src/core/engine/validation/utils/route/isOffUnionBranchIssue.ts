import type { Nullable } from '@aileron/declare';

import type { SchemaFragment } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../types/issue';
import { countEvaluatedSegments } from './isOffUnionBranchIssue/countEvaluatedSegments';
import { isDefinitionPositionOff } from './isOffUnionBranchIssue/isDefinitionPositionOff';
import {
  type IssueLocation,
  readIssueLocation,
} from './isOffUnionBranchIssue/readIssueLocation';
import { resolveUnionBranch } from './isOffUnionBranchIssue/resolveUnionBranch';

/**
 * Decide whether an issue exists only because of a union branch the form did not select.
 * Two kinds of position visible in the issue's schema location are resolved, each at its
 * host: the occurrence that many instance-moving keywords above the instance path the
 * failing keyword was evaluated on. A union segment is off when it resolves to an
 * uncommitted branch whose union has a committed sibling at that host. A `$defs/<name>` or
 * `definitions/<name>` position is off when its fragment is not committed at the host and an
 * off branch on the instance path reaches it. The issue is dropped when a resolved position
 * is off; an issue that cannot be attributed is kept.
 * @param issue - Normalized issue with an absolute `dataPath`; its schema location may restart at a reference.
 * @param node - Occurrence the issue's instance path resolved to; it may stop above the path at a terminal value.
 * @param fragments - The blueprint's fragment table, indexed by fragment id.
 * @param isActive - Committed branch evidence for a fragment at a given host occurrence.
 * @param locations - Optional per-routing-pass cache of parsed schema locations.
 * @returns True only when some resolved position is off.
 */
export const isOffUnionBranchIssue = <Self extends FieldNodeRecord<Self>>(
  issue: ValidationIssue,
  node: Self,
  fragments: readonly SchemaFragment[],
  isActive: (fragment: SchemaFragment, host: Self) => boolean,
  locations?: Map<string, Nullable<IssueLocation>>,
): boolean => {
  const schemaPath = issue.schemaPath;
  if (!schemaPath) return false;
  let location = locations?.get(schemaPath);
  if (location === undefined) {
    location = readIssueLocation(schemaPath);
    locations?.set(schemaPath, location);
  }
  if (!location || (!location.unions.length && !location.definitions.length))
    return false;
  const depth = countEvaluatedSegments(issue, location);
  for (const position of location.definitions) {
    const host = climbTo(node, depth - position.moves);
    if (
      host &&
      isDefinitionPositionOff(position.location, host, fragments, isActive)
    )
      return true;
  }
  for (const segment of location.unions) {
    const host = climbTo(node, depth - segment.moves);
    if (!host) continue;
    const branch = resolveUnionBranch(segment, host.blueprintNode, fragments);
    if (!branch || isActive(branch.fragment, host)) continue;
    for (const sibling of branch.siblings)
      if (isActive(sibling, host)) return true;
  }
  return false;
};

/**
 * Find the ancestor of an occurrence at a given depth.
 * @param node - Occurrence to climb from.
 * @param depth - Number of segments of the wanted ancestor's path.
 * @returns The ancestor, or null when the depth is negative or below the occurrence.
 */
const climbTo = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  depth: number,
): Nullable<Self> => {
  if (depth < 0 || depth > node.depth) return null;
  let host: Nullable<Self> = node;
  for (let level = node.depth; host && level > depth; level--)
    host = host.__parent__;
  return host;
};
