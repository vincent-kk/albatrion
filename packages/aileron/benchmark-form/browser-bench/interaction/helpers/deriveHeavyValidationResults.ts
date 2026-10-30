import type { PageRecord } from '../types';
import { summarizePairs } from './summarizePairs';
import type { SampleResult } from './summarizeResults';
import { summarizeResults } from './summarizeResults';

/**
 * Apply the pre-registered D1 rule without judging burst or mount rows.
 * @param samples - Retained fresh pages, excluding warm-ups.
 * @param mode - Start-gate mode; maximum statistics under load remain provisional.
 * @param pages - Canonical page records, including external CPU counters.
 * @returns Reproducible summaries, paired comparisons and mechanical decision data.
 */
export function deriveHeavyValidationResults(
  samples: SampleResult[],
  mode: string,
  pages: Record<string, PageRecord>,
) {
  const rows = summarizeResults(samples);
  const gates = rows
    .filter((row) => row.lane === 'E1' && row.id.endsWith('-nonburst'))
    .map((row) => {
      const processing = row.processing.p95 ?? row.handler.p95;
      const validation = row.validation.p95;
      return {
        id: row.id,
        processingSource: row.processing.p95 === null ? 'handler' : 'event',
        processingP95: processing,
        validationP95: validation,
        processingPass: processing !== null && processing <= 16.67,
        validationPass: validation !== null && validation <= 33.4,
        nearLine:
          (processing !== null && processing >= 16.67 * 0.9) ||
          (validation !== null && validation >= 33.4 * 0.9),
      };
    });
  return {
    rows,
    pairs: summarizePairs(samples),
    cpu: {
      pages: samples.length,
      heavyPages: samples.filter((sample) =>
        pages[sample.file].externalCpu!.rows.some((row) => row.cpuPercent > 30),
      ).length,
      byRow: rows.map((row) => ({
        id: row.id,
        lane: row.lane,
        heavyPages: samples.filter(
          (sample) =>
            sample.id === row.id &&
            sample.lane === row.lane &&
            pages[sample.file].externalCpu!.rows.some(
              (entry) => entry.cpuPercent > 30,
            ),
        ).length,
      })),
      nonburstPages: samples
        .filter((sample) => sample.id.endsWith('-nonburst'))
        .map((sample) => ({
          id: sample.id,
          lane: sample.lane,
          index: sample.index,
          processingP95: sample.summary.processing.p95,
          validationP95: sample.summary.validation.p95,
          externalHeavy: pages[sample.file].externalCpu!.rows.filter(
            (row) => row.cpuPercent > 30,
          ),
          maximumExternalPidPercent: Math.max(
            0,
            ...pages[sample.file].externalCpu!.rows.map(
              (row) => row.cpuPercent,
            ),
          ),
        })),
    },
    decision: {
      mode,
      provisional: mode === 'paired-relative',
      processingLimitMs: 16.67,
      validationLimitMs: 33.4,
      gates,
      triggered: gates.some(
        (gate) =>
          (gate.processingP95 !== null && gate.processingP95 > 16.67) ||
          (gate.validationP95 !== null && gate.validationP95 > 33.4),
      ),
      remeasureIfQuiet:
        mode === 'paired-relative'
          ? gates
              .filter(
                (gate) =>
                  !gate.processingPass || !gate.validationPass || gate.nearLine,
              )
              .map((gate) => gate.id)
          : [],
    },
  };
}
