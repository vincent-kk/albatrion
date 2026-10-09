import assert from 'node:assert/strict';
import { estimateSession131 } from './estimate-session-131.mjs';
import { planningCosts131 } from './planning-costs-131.mjs';

/** Plan before workers start; reserve max(20 minutes, 25%) for independent confirmation, except smoke/confirm-only. */
export function preflightSession131(options, rows, budgetMs = options.budgetSeconds * 1000) {
  const cost = planningCosts131(options.lane);
  const estimate = estimateSession131(cost.processes, rows, { ...cost, formsPerProcess: options.formsPerProcess,
    observedReportMs: cost.reportMs, targetWarmup: options.warmup, targetSamples: options.samples,
    targetFullBlocks: options.blocks, targetReducedBlocks: options.reducedBlocks });
  const confirmReserveMs = options.smoke || options.kind === 'confirm' ? 0 : Math.max(1200000, estimate.totalMs * .25);
  const requiredMs = estimate.totalMs + confirmReserveMs;
  return { estimate, confirmReserveMs, requiredMs, budgetMs, sourceSha256: cost.sourceSha256,
    fits: estimate.complete && Number.isFinite(requiredMs) && requiredMs < budgetMs,
    limitation: 'Planning extrapolation, not a runtime guarantee. Actual flagged confirmation rows are checked again against remaining budget.' };
}

/** Refuse before any worker timing when complete planning evidence plus the confirmation reserve cannot fit. */
export function assertBudget131(preflight) {
  assert(preflight.estimate.complete, 'No complete fixture cost evidence; cannot start measurement');
  assert(preflight.fits, `Before measurement: estimated ${(preflight.estimate.totalMs / 1000).toFixed(3)}s + confirmation reserve ${(preflight.confirmReserveMs / 1000).toFixed(3)}s exceeds remaining budget ${(preflight.budgetMs / 1000).toFixed(3)}s; split --rows`);
}
