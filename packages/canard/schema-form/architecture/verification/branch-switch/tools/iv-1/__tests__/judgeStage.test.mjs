import assert from 'node:assert/strict';
import test from 'node:test';

import { judgeStage } from '../judgeStage.mjs';

test('allows zero only for the approved static selectChildren stage', () => {
  const zero = { median: 0, min: 0, max: 0 };
  assert.equal(
    judgeStage('single-nested-d6-f4', 'selectChildren', zero, zero).passed,
    true,
  );
  assert.equal(
    judgeStage('switch-nested-oneOf-20', 'selectChildren', zero, zero).passed,
    false,
  );
  assert.equal(
    judgeStage('single-nested-d6-f4', 'commitSettlement', zero, zero).passed,
    false,
  );
});

test('uses A process spread below two microseconds and requires decrease at two', () => {
  const A = { median: 1.5, min: 1.375, max: 1.625 };
  assert.equal(
    judgeStage('single-nested-d6-f4', 'commitSettlement', A, { median: 1.75 })
      .passed,
    true,
  );
  assert.equal(
    judgeStage('single-nested-d6-f4', 'commitSettlement', A, { median: 1.875 })
      .passed,
    false,
  );
  assert.equal(
    judgeStage(
      'single-nested-d6-f4',
      'computeNode',
      { ...A, median: 2 },
      { median: 2 },
    ).passed,
    false,
  );
});
