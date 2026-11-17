import type { CoreFixture } from '../../../../../fixtures/core/types';
import type {
  CoreFrameBudget,
  CoreMetricStatistics,
} from '../../../reportTypes';
import { CORE_FRAME_BUDGET_MS } from '../../coreFrameBudgetMs';

/**
 * Express the blocking median in 16.7 ms frames.
 * @param operation - Only typing and first-key have a direct blocking measure.
 * @param blocking - blockingMs statistics of one variant.
 * @param budgetMs - Fixed UX budget in ms; defaults to the unchanged primary 16.7 ms.
 * @returns Frames, overflow and the over-budget flag; null (N/A) for loads or a non-numeric statistic.
 */
export function computeCoreFrameBudget(
  operation: CoreFixture['operation'],
  blocking: CoreMetricStatistics,
  budgetMs = CORE_FRAME_BUDGET_MS,
): CoreFrameBudget {
  if (
    (operation !== 'type' && operation !== 'first-key') ||
    blocking.kind !== 'numeric'
  )
    return null;
  return {
    frames: blocking.medianMs / budgetMs,
    overflowMs: Math.max(0, blocking.medianMs - budgetMs),
    overBudget: blocking.medianMs > budgetMs,
  };
}
