import {
  isAbsolutePointer,
  joinPointer,
  parseStandardPointer,
} from '@/schema-form/helpers/jsonPointer';

import type { ValidationIssue } from '../../types/issue';

/**
 * Rewrite one RFC 6901 pointer into the consumer form address.
 * @param pointer - Validator-owned address; the empty string is the root.
 * @param keepFragment - Whether a leading `#` is carried over to the result.
 * @returns The rewritten address, or undefined for a value that is not a pointer or whose percent escape is malformed.
 */
const rewritePointer = (
  pointer: string,
  keepFragment: boolean,
): string | undefined => {
  if (pointer !== '' && !isAbsolutePointer(pointer)) return undefined;
  const prefix = keepFragment && pointer[0] === '#' ? '#' : '';
  try {
    return prefix + joinPointer(parseStandardPointer(pointer));
  } catch {
    return undefined;
  }
};

/**
 * Convert validator-owned RFC addresses once at ingress to consumer form addresses.
 * @param issue - Validator output whose `dataPath` and `schemaPath` are unconstrained strings.
 * @returns The same object when nothing changes. A `dataPath` that cannot be rewritten leaves the issue untouched and unroutable; a `schemaPath` that cannot be rewritten keeps its original text.
 */
export const normalizeValidationIssue = (
  issue: ValidationIssue,
): ValidationIssue => {
  const dataPath = rewritePointer(issue.dataPath, false);
  if (dataPath === undefined) return issue;
  const schemaPath = issue.schemaPath
    ? (rewritePointer(issue.schemaPath, true) ?? issue.schemaPath)
    : issue.schemaPath;
  return dataPath === issue.dataPath && schemaPath === issue.schemaPath
    ? issue
    : {
        ...issue,
        dataPath,
        ...(schemaPath === undefined ? {} : { schemaPath }),
      };
};
