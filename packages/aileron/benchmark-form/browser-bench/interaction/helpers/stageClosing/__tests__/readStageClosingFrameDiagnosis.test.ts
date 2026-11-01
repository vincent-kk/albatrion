import { expect, it } from 'vitest';

import type { ValidatorWorkRow } from '../../../stageClosingTypes';
import { readStageClosingFrameDiagnosis } from '../readStageClosingFrameDiagnosis';

const row = (lane: string, fraction: number): ValidatorWorkRow => ({
  id: 'reset-flat-500-same',
  lane,
  units: 100,
  compileCalls: 100,
  validateCalls: 100,
  compileMean: 1,
  validateMean: 1,
  setupCompileCalls: 0,
  setupValidateCalls: 0,
  lateCompileCalls: 0,
  lateValidateCalls: 0,
  unattributed: 0,
  operationsWithLongFrame: fraction * 100,
  longFrameFraction: fraction,
});
it('diagnoses a pooled operation fraction increase strictly above 0.20', () => {
  expect(
    readStageClosingFrameDiagnosis([row('B', 0.1), row('F', 0.31)]),
  ).toMatchObject([
    {
      id: 'reset-flat-500-same',
      metric: 'longFrameFraction',
      reason: 'operation-frame-fraction',
    },
  ]);
  expect(readStageClosingFrameDiagnosis([row('B', 0), row('F', 0.2)])).toEqual(
    [],
  );
});

it('does not diagnose an exact 20/100 increase despite floating-point subtraction', () => {
  expect(
    readStageClosingFrameDiagnosis([row('B', 0.6), row('F', 0.8)]),
  ).toEqual([]);
});
