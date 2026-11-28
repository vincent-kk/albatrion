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
import type { UnionSegment } from './readUnionSegments';

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
 * Resolve one union segment among the branch fragments bound at its host. When several
 * unions at the host have a branch with the segment's keyword and index, the segment's run
 * must be the tail of exactly one candidate's run; anything else stays unresolved.
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
  if (candidates.length > 1)
    candidates = candidates.filter((fragment) =>
      isRunTail(readBranchRun(fragment), segment.run),
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
 * Report whether one run ends with another, keyword by keyword and argument by argument.
 * @param run - A candidate fragment's run; undefined never matches.
 * @param tail - The issue segment's run.
 * @returns True when every keyword of `tail` equals the keyword at the same distance from the end of `run`.
 */
const isRunTail = (
  run: readonly SchemaStep[] | undefined,
  tail: readonly SchemaStep[],
): boolean => {
  if (!run || run.length < tail.length) return false;
  const offset = run.length - tail.length;
  return tail.every(
    (step, index) =>
      step.keyword === run[offset + index].keyword &&
      step.argument === run[offset + index].argument,
  );
};
