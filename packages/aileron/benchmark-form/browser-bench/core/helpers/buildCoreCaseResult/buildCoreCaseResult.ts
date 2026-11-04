import type { CoreCaseResult } from '../../reportTypes';
import type { CoreMeasurement } from '../../types';
import { summarizeCoreSamples } from '../summarizeCoreSamples';

/** Measurements grouped by variant. */
export type CoreVariantGroups = Record<
  'candidate' | 'baseline' | 'control',
  CoreMeasurement[]
>;

/**
 * Assemble one case result from grouped measurements.
 * @param id - Core case identifier.
 * @param attempt - First group or its retry.
 * @param groups - Measurements per variant.
 * @param compare - Whether baseline and control participate.
 * @returns The case result.
 */
export function buildCoreCaseResult(
  id: string,
  attempt: 1 | 2,
  groups: CoreVariantGroups,
  compare: boolean,
): CoreCaseResult {
  void attempt;
  void compare;
  const neutral: CoreCaseResult['metrics']['durationMs'] = {
    candidate: { kind: 'not-observable' },
    verdict: 'not observable',
  };
  return {
    id,
    candidate: summarizeCoreSamples(groups.candidate.map((m) => m.durationMs)),
    verdict: 'measured',
    metrics: {
      durationMs: neutral,
      blockingMs: neutral,
      maxLongTaskMs: neutral,
      longTaskOverlapMs: neutral,
      preFrameValidatorMs: neutral,
      postFrameValidatorMs: neutral,
      validatorSettledMs: neutral,
      feedbackCommittedMs: neutral,
      validationReportedMs: neutral,
      longestFrameMs: neutral,
      frameOverflowMs: neutral,
    },
    budget: { candidate: null },
    ux: { candidate: { blocking: 'n/a', feedback: 'n/a' } },
  };
}
