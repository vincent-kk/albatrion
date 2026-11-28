import type { Nullable } from '@aileron/declare';

import {
  isAbsolutePointer,
  joinPointerWithPrefixOf,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import { type SchemaStep, parseSchemaLocation } from './parseSchemaLocation';
import { readComparedRun } from './readComparedRun';

/** One `oneOf`/`anyOf` branch step visible in an issue's schema location. */
export interface UnionSegment {
  /** Union keyword, `oneOf` or `anyOf`. */
  readonly keyword: string;
  /** Decimal branch index as written in the location. */
  readonly index: string;
  /** Instance-moving keywords written after the segment; the issue's host lies this many tokens above its instance path. */
  readonly moves: number;
  /** Non-moving keywords written immediately before the segment, as produced by `readComparedRun`. */
  readonly run: readonly SchemaStep[];
  /** Canonical location as written from `#` up to and including the segment's index. */
  readonly location: string;
}

/** What routing reads from an issue's schema location. */
export interface IssueLocation {
  /** Union segments innermost first; empty when none is visible. */
  readonly unions: readonly UnionSegment[];
  /** The failing keyword, the location's last segment. */
  readonly keyword: string;
  /** Whether the keyword before the failing keyword moves the instance, as `properties/<key>` before `false schema` does. */
  readonly isAfterMove: boolean;
}

/**
 * Read an issue's schema location: its union segments innermost first and its failing
 * keyword. A validator restarts the location at a reference but never drops a move written
 * after a visible segment, so `moves` places the host correctly wherever the location restarted.
 * @param schemaPath - Absolute schema location ending in the failing keyword, such as `#/oneOf/1/properties/a/minLength`.
 * @returns The parsed location, or null when it is not absolute or does not parse.
 */
export const readIssueLocation = (
  schemaPath: string,
): Nullable<IssueLocation> => {
  if (!isAbsolutePointer(schemaPath)) return null;
  const segments = parsePointerSegments(schemaPath);
  const keyword = segments[segments.length - 1];
  if (typeof keyword !== 'string') return null;
  const steps = parseSchemaLocation(segments, segments.length - 1);
  if (!steps) return null;
  const unions: UnionSegment[] = [];
  let moves = 0;
  for (let index = steps.length - 1; index >= 0; index--) {
    const step = steps[index];
    if (step.kind === 'move') moves++;
    else if (step.kind === 'union' && step.argument !== undefined)
      unions.push({
        keyword: step.keyword,
        index: step.argument,
        moves,
        run: readComparedRun(steps, index),
        location: joinPointerWithPrefixOf(
          schemaPath,
          segments.slice(0, step.end),
        ),
      });
  }
  return {
    unions,
    keyword,
    isAfterMove: steps[steps.length - 1]?.kind === 'move',
  };
};
