import {
  isAbsolutePointer,
  joinPointer,
  parseStandardPointer,
} from '@/schema-form/helpers/jsonPointer';

import type { ValidationIssue } from '../../types/issue';

/** Convert validator-owned RFC addresses once at ingress to consumer form addresses. */
export const normalizeValidationIssue = (
  issue: ValidationIssue,
): ValidationIssue => {
  if (issue.dataPath !== '' && !isAbsolutePointer(issue.dataPath)) return issue;
  const dataPath = joinPointer(parseStandardPointer(issue.dataPath));
  const schemaPath = issue.schemaPath
    ? (issue.schemaPath[0] === '#' ? '#' : '') +
      joinPointer(parseStandardPointer(issue.schemaPath))
    : issue.schemaPath;
  return dataPath === issue.dataPath && schemaPath === issue.schemaPath
    ? issue
    : {
        ...issue,
        dataPath,
        ...(schemaPath === undefined ? {} : { schemaPath }),
      };
};
