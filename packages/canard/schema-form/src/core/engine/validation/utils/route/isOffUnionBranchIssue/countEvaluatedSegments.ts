import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { ValidationIssue } from '../../../types/issue';
import type { IssueLocation } from './readIssueLocation';

/**
 * Count the segments of the instance path the failing keyword was evaluated on. The
 * validator plugins move two kinds of issue away from that path, and this inverts exactly
 * those two: a `required` issue is reported at the missing property, one segment below
 * the evaluated object, and a `false schema` issue under an instance-moving keyword is
 * reported at the parent with the rejected property in `rejectedKey`, one segment above.
 * `dependentRequired` and the array form of `dependencies` are reported where they are
 * evaluated. Path names escape `/`, so counting separators counts segments.
 * @param issue - Normalized issue with an absolute `dataPath`.
 * @param location - The issue's parsed schema location.
 * @returns The number of segments of the evaluated instance path.
 */
export const countEvaluatedSegments = (
  issue: ValidationIssue,
  location: IssueLocation,
): number => {
  const path = issue.dataPath;
  let count = 0;
  for (let index = 0; index < path.length; index++)
    if (path[index] === $.Separator) count++;
  if (location.keyword === 'required') return Math.max(count - 1, 0);
  if (
    location.keyword === 'false schema' &&
    location.isAfterMove &&
    issue.rejectedKey !== undefined
  )
    return count + 1;
  return count;
};
