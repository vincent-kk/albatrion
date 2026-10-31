import type { FieldNode } from '@/schema-form/core';

import { createShowErrorChecker } from './createShowErrorChecker';

/** One pre-change node eligibility interval, ordered with policy commits. */
type NodeEntry = {
  state: FieldNode['state'];
  enabled: boolean;
  generation: number;
};
/** Committed policy plus every unreleased preceding value. */
type PolicyHistory = {
  value: unknown;
  entries: readonly { value: unknown; generation: number }[];
};
/** Check every eligibility combination that existed since the last release.
 * @param live - Current display condition, including its React-only disabled input.
 * @param state - Current node interaction flags.
 * @param enabled - Current active/visible conjunction.
 * @param policy - Policy rendered by the current context.
 * @param entries - Node intervals, ascending by generation.
 * @param history - Committed policy and preceding committed intervals.
 * @param includeEnabled - False for child-error aggregates that include hidden nodes.
 * @returns Whether the error stayed eligible throughout all unreleased intervals. */
export const resolveErrorVisibility = (
  live: boolean,
  state: FieldNode['state'],
  enabled: boolean,
  policy: unknown,
  entries: readonly NodeEntry[],
  history: PolicyHistory | undefined,
  includeEnabled: boolean,
): boolean => {
  if (!live || (includeEnabled && !enabled)) return false;
  let i = 0,
    j = 0;
  while (true) {
    const nodeEntry = entries[i];
    const policyEntry = history?.entries[j];
    const beforePolicy = policyEntry
      ? policyEntry.value
      : history
        ? history.value
        : policy;
    if (
      !createShowErrorChecker(beforePolicy)(nodeEntry?.state ?? state) ||
      (includeEnabled && !(nodeEntry?.enabled ?? enabled))
    )
      return false;
    if (!nodeEntry && !policyEntry) return true;
    const nodeGeneration = nodeEntry?.generation ?? Infinity;
    const policyGeneration = policyEntry?.generation ?? Infinity;
    if (nodeGeneration <= policyGeneration) i++;
    if (policyGeneration <= nodeGeneration) j++;
  }
};
