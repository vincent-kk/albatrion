import {
  joinPointer,
  normalizeValidationDataPath,
  parsePointer,
  parseStandardPointer,
} from '@/schema-form/helpers/jsonPointer';

import type { ValidationIssue } from '../../types/issue';

/** Convert validator-owned RFC addresses once at ingress to consumer form addresses. */
export const normalizeValidationIssue = (
  issue: ValidationIssue,
): ValidationIssue => {
  if (issue.dataPath !== '' && !parsePointer(issue.dataPath).absolute)
    return issue;
  const normalizedDataPath = normalizeValidationDataPath(issue.dataPath);
  const dataPath = normalizedDataPath
    ? joinPointer(parseStandardPointer(normalizedDataPath))
    : issue.dataPath;
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
