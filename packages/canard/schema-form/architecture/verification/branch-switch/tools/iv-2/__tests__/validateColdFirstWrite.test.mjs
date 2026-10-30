import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateColdFirstWrite } from '../helpers/validateColdFirstWrite.mjs';

const fixture = () => ({
  warmups: 0,
  sampleCount: 100,
  records: ['mount-oneOf-80', 'mount-flat-1000', 'mount-nested-d6-f4'].map(
    (row) => ({
      row,
      samples: { A: Array(100).fill(10), B: Array(100).fill(12) },
      AColdUs: 10,
      BColdUs: 12,
      formsCreated: { A: 100, B: 100 },
      medianUs: 2,
    }),
  ),
});
test('retained cold samples prove symmetric weight-one additions', () => {
  const input = fixture();
  assert.equal(validateColdFirstWrite(input), input);
});
test('forged cold medians are rejected instead of entering the exchange', () => {
  const input = fixture();
  input.records[0].AColdUs = 100;
  assert.throws(() => validateColdFirstWrite(input));
});
test('a warmed or reused-form record is rejected', () => {
  const input = fixture();
  input.warmups = 20;
  assert.throws(() => validateColdFirstWrite(input));
  input.warmups = 0;
  input.records[1].formsCreated.B = 99;
  assert.throws(() => validateColdFirstWrite(input));
});
