import type { ValidationIssue } from '../../type';

/** Stable empty whole-form issue list before validation and when both error channels are empty. */
export const EMPTY_GLOBAL_ERRORS: readonly ValidationIssue[] = Object.freeze(
  [],
);
