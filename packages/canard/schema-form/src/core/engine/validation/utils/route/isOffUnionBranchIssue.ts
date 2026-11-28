import type { Nullable } from '@aileron/declare';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { SchemaFragment } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../types/issue';
import {
  type UnionSegment,
  readUnionSegments,
} from './isOffUnionBranchIssue/readUnionSegments';
import { resolveUnionBranch } from './isOffUnionBranchIssue/resolveUnionBranch';

/**
 * Decide whether an issue exists only because of a union branch the form did not select.
 * Each union segment visible in the issue's schema location is resolved at its host: the
 * occurrence that many instance-moving keywords above the issue's instance path. The issue
 * is off-branch when some segment resolves to an uncommitted branch whose union has a
 * committed sibling at that host. An issue that cannot be attributed is kept.
 * @param issue - Normalized issue with an absolute `dataPath`; its schema location may restart at a reference.
 * @param node - Occurrence the issue's instance path resolved to; it may stop above the path at a terminal value.
 * @param fragments - The blueprint's fragment table, indexed by fragment id.
 * @param isActive - Committed branch evidence for a fragment at a given host occurrence.
 * @param locations - Optional per-routing-pass cache of parsed schema locations.
 * @returns True only when a segment's branch is resolved uniquely, uncommitted, and has a committed sibling.
 */
export const isOffUnionBranchIssue = <Self extends FieldNodeRecord<Self>>(
  issue: ValidationIssue,
  node: Self,
  fragments: readonly SchemaFragment[],
  isActive: (fragment: SchemaFragment, host: Self) => boolean,
  locations?: Map<string, Nullable<readonly UnionSegment[]>>,
): boolean => {
  const schemaPath = issue.schemaPath;
  if (!schemaPath) return false;
  let segments = locations?.get(schemaPath);
  if (segments === undefined) {
    segments = readUnionSegments(schemaPath);
    locations?.set(schemaPath, segments);
  }
  if (!segments?.length) return false;
  const depth = countSegments(issue.dataPath);
  for (const segment of segments) {
    const hostDepth = depth - segment.moves;
    if (hostDepth < 0 || hostDepth > node.depth) continue;
    let host: Nullable<Self> = node;
    for (let level = node.depth; host && level > hostDepth; level--)
      host = host.__parent__;
    if (!host) continue;
    const branch = resolveUnionBranch(segment, host.blueprintNode, fragments);
    if (!branch || isActive(branch.fragment, host)) continue;
    for (const sibling of branch.siblings)
      if (isActive(sibling, host)) return true;
  }
  return false;
};

/**
 * Count the segments of an absolute form pointer without parsing it; names escape `/`.
 * @param path - Absolute instance path, the empty string for the root.
 * @returns The number of segments.
 */
const countSegments = (path: string): number => {
  let count = 0;
  for (let index = 0; index < path.length; index++)
    if (path[index] === $.Separator) count++;
  return count;
};
