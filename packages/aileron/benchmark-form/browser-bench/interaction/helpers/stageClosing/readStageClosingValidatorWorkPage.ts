import type { StageClosingPage } from '../../stageClosingTypes';

/** Attribute by entry start, preserving setup, gaps and mount work beyond the first second. */
export function readStageClosingValidatorWorkPage(page: StageClosingPage) {
  const operations = page.closing.operations;
  const result = {
    units: operations.length || 1,
    compileCalls: 0,
    validateCalls: 0,
    setupCompileCalls: 0,
    setupValidateCalls: 0,
    lateCompileCalls: 0,
    lateValidateCalls: 0,
    unattributed: 0,
    operationsWithLongFrame: operations.filter((op) => op.longFrameCount >= 1)
      .length,
  };
  const start = operations[0]?.start ?? page.mount.startedAt;
  if (start === undefined)
    throw new Error('Missing validator work attribution boundary');
  for (const entry of page.closing.validatorWork) {
    const compile = entry.kind === 'compile';
    if (entry.start < start) {
      if (compile) result.setupCompileCalls++;
      else result.setupValidateCalls++;
      continue;
    }
    if (
      operations.length &&
      !operations.some((op) => entry.start >= op.start && entry.start < op.end)
    ) {
      result.unattributed++;
      continue;
    }
    if (compile) result.compileCalls++;
    else result.validateCalls++;
    if (!operations.length && entry.start >= start + 1000) {
      if (compile) result.lateCompileCalls++;
      else result.lateValidateCalls++;
    }
  }
  return result;
}
