import type { CoreCaseResult } from '../reportTypes';
import { summarizeCoreSamples } from './summarizeCoreSamples';

/**
 * Judge a complete fresh-page group using its identical baseline control.
 * @param id - Core case identifier determining the metric's fixed threshold.
 * @param baselineSamples - Baseline durations in the same unit as candidate/control.
 * @param candidateSamples - Workspace durations, per write for typing cases.
 * @param controlSamples - Durations from the byte copy of the baseline bundle.
 * @param attempt - One for the first group, two for its only retry.
 * @returns Statistics and an advisory verdict; invalid evidence throws.
 */
export function decideCoreComparison(
  id: string,
  baselineSamples: readonly number[],
  candidateSamples: readonly number[],
  controlSamples: readonly number[],
  attempt: 1 | 2,
): CoreCaseResult {
  const baseline = summarizeCoreSamples(baselineSamples);
  const candidate = summarizeCoreSamples(candidateSamples);
  const control = summarizeCoreSamples(controlSamples);
  const typing = id.startsWith('type-');
  const firstKey = id.startsWith('first-key-');
  const thresholdMs = Math.max(
    typing ? 0.05 : 0.5,
    baseline.medianMs * (typing || firstKey ? 0.05 : 0.03),
  );
  const controlBandMs = Math.max(0.3, baseline.medianMs * 0.03);
  const deltaMs = candidate.medianMs - baseline.medianMs;
  const epsilon =
    Number.EPSILON *
    Math.max(1, baseline.medianMs, candidate.medianMs, control.medianMs) *
    4;
  const invalid =
    Math.abs(control.medianMs - baseline.medianMs) > controlBandMs + epsilon;
  const verdict = invalid
    ? attempt === 1
      ? 'retry'
      : 'void'
    : Math.abs(deltaMs) <= thresholdMs + epsilon
      ? 'within noise'
      : deltaMs > 0
        ? 'slower'
        : 'faster';
  return {
    id,
    baseline,
    candidate,
    control,
    deltaMs,
    thresholdMs,
    controlBandMs,
    attempt,
    verdict,
  };
}
