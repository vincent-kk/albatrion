import type { CoreMetrics } from '../../../types';

/** Frame fields of the metrics. */
export type CoreFrameGapSummary = Pick<
  CoreMetrics,
  'frames' | 'longestFrameMs' | 'frameOverflowMs' | 'overBudgetFrames'
>;

/**
 * Summarize the rAF gaps that end inside a window; the gap straddling the start mark counts.
 * @param stamps - Animation frame clock readings in order.
 * @param startMs - Window start.
 * @param endMs - Window end (inclusive).
 * @param budgetMs - Frame budget; longer gaps overflow.
 * @returns Gap count, longest gap, overflow sum and over-budget count.
 */
export function summarizeCoreFrameGaps(
  stamps: readonly number[],
  startMs: number,
  endMs: number,
  budgetMs: number,
): CoreFrameGapSummary {
  const summary: CoreFrameGapSummary = {
    frames: 0,
    longestFrameMs: 0,
    frameOverflowMs: 0,
    overBudgetFrames: 0,
  };
  for (let index = 1; index < stamps.length; index++) {
    const at = stamps[index];
    if (at <= startMs || at > endMs) continue;
    const gap = at - stamps[index - 1];
    summary.frames++;
    summary.longestFrameMs = Math.max(summary.longestFrameMs, gap);
    summary.frameOverflowMs += Math.max(0, gap - budgetMs);
    if (gap > budgetMs) summary.overBudgetFrames++;
  }
  return summary;
}
