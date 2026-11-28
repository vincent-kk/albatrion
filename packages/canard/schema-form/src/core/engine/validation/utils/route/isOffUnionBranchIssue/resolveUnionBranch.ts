import type { Nullable } from '@aileron/declare';

import {
  JSONPointer as $,
  isDescendantPath,
  parsePointerSegments,
  readPointerSegment,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { BlueprintNode, SchemaFragment } from '../../../../blueprint';
import { type SchemaStep, parseSchemaLocation } from './parseSchemaLocation';
import { readComparedRun } from './readComparedRun';
import type { UnionSegment } from './readIssueLocation';

/** The branch fragment one union segment resolves to at its host, with the other branches of the same union. */
export interface UnionBranch {
  /** The resolved branch; carried as the fragment object, since two fragments may share a location. */
  readonly fragment: SchemaFragment;
  /** Other branches of the same union bound at the same host. */
  readonly siblings: readonly SchemaFragment[];
}

/** A decimal branch index ending a fragment location after its union keyword. */
const BRANCH_INDEX = /^\d+$/;

/**
 * Resolve one union segment among the branch fragments bound at its host. A candidate has
 * the segment's keyword and index, and its run equals the segment's run, or ends with it
 * when the segment's run reaches the start of the location. Several candidates
 * resolve only when exactly one authored location equals the segment's location as written,
 * which the `schemaPath` contract (an authored location) lets the form take at its word.
 * @param segment - Union segment read from the issue's schema location.
 * @param host - Blueprint template of the host occurrence; its declarations name the fragments bound there.
 * @param fragments - The blueprint's fragment table, indexed by fragment id.
 * @returns The unique branch and its siblings, or null when no candidate or several remain.
 */
export const resolveUnionBranch = (
  segment: UnionSegment,
  host: BlueprintNode,
  fragments: readonly SchemaFragment[],
): Nullable<UnionBranch> => {
  let candidates: SchemaFragment[] = [];
  for (const declaration of host.declarations) {
    const fragment = fragments[declaration.fragmentId];
    if (
      readPointerSegment(fragment.schemaPath, -1) === segment.index &&
      readPointerSegment(fragment.schemaPath, -2) === segment.keyword &&
      !candidates.includes(fragment)
    )
      candidates.push(fragment);
  }
  candidates = candidates.filter((fragment) =>
    isRunMatch(readBranchRun(fragment), segment),
  );
  if (candidates.length > 1)
    candidates = candidates.filter(
      (fragment) => fragment.schemaPath === segment.location,
    );
  if (candidates.length !== 1) return null;
  const fragment = candidates[0];
  const union = resolvePointer(fragment.schemaPath, $.Parent);
  const siblings: SchemaFragment[] = [];
  for (const declaration of host.declarations) {
    const sibling = fragments[declaration.fragmentId];
    if (
      sibling !== fragment &&
      isDescendantPath(sibling.schemaPath, union) &&
      BRANCH_INDEX.test(sibling.schemaPath.slice(union.length + 1)) &&
      !siblings.includes(sibling)
    )
      siblings.push(sibling);
  }
  return { fragment, siblings };
};

/**
 * Read the run before a branch fragment's own union step.
 * @param fragment - Branch fragment whose location ends in `oneOf/<i>` or `anyOf/<i>`.
 * @returns The run as `readComparedRun` reads it, or undefined when the location does not parse.
 */
const readBranchRun = (
  fragment: SchemaFragment,
): readonly SchemaStep[] | undefined => {
  const segments = parsePointerSegments(fragment.schemaPath);
  const steps = parseSchemaLocation(segments, segments.length);
  return steps?.length ? readComparedRun(steps, steps.length - 1) : undefined;
};

/**
 * Compare a candidate's run with a segment's run, keyword by keyword and argument by argument.
 * @param authored - The candidate fragment's run; undefined never matches.
 * @param segment - The issue segment; an open run may have lost its start to a restart.
 * @returns True when the runs are equal, or when the segment's run is open and ends `authored`.
 */
const isRunMatch = (
  authored: readonly SchemaStep[] | undefined,
  segment: UnionSegment,
): boolean => {
  const visible = segment.run;
  const offset = authored ? authored.length - visible.length : -1;
  if (!authored || offset < 0 || (offset > 0 && !segment.isRunOpen))
    return false;
  return visible.every(
    (step, index) =>
      step.keyword === authored[offset + index].keyword &&
      step.argument === authored[offset + index].argument,
  );
};
