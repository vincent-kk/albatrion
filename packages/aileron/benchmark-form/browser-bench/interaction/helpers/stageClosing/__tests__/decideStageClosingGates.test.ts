import { describe, expect, it } from 'vitest';

import { decideStageClosingGates } from '../decideStageClosingGates';
import { closingGateFixture } from './fixtures/closingGateFixture';

/** Run the actual decision function, without mirroring its comparisons in the fixture. */
const decide = (data: ReturnType<typeof closingGateFixture>) =>
  decideStageClosingGates(
    data.rows,
    data.bounds,
    data.ir6B,
    data.ir6S,
    data.samples,
    data.pages,
  );
/** Fail loudly when a test asks for an unknown gate. */
const verdict = (data: ReturnType<typeof closingGateFixture>, id: string) =>
  decide(data).find((gate) => gate.id === id)?.status;

describe('pre-registered C0 to C7 gates', () => {
  it('passes complete known evidence and preserves all eight gate identifiers', () => {
    expect(decide(closingGateFixture()).map((g) => [g.id, g.status])).toEqual(
      ['C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'].map((id) => [
        id,
        'PASS',
      ]),
    );
  });
  it('preserves the original G1 transfer verdict in C0', () => {
    const data = closingGateFixture();
    data.ir6B[0].status = 'INDETERMINATE';
    expect(verdict(data, 'C0')).toBe('INDETERMINATE');
    data.ir6B[0].status = 'FAIL';
    expect(verdict(data, 'C0')).toBe('FAIL');
  });
  it('C1 rejects above 1.10 and preserves absent processing evidence', () => {
    const data = closingGateFixture();
    data.bounds['type-flat-500-validate-burst'].processing.upperBound =
      1.100001;
    expect(verdict(data, 'C1')).toBe('FAIL');
    data.bounds['type-flat-500-validate-burst'].processing.upperBound = null;
    expect(verdict(data, 'C1')).toBe('INDETERMINATE');
  });
  it('C2 enforces duration and the single additional frame allowance independently', () => {
    const data = closingGateFixture(),
      row = data.rows.find(
        (r) => r.lane === 'F' && r.id === 'type-flat-500-validate-burst',
      );
    if (!row) throw new Error('Fixture missing');
    row.durationP95 = 24;
    row.longFrameCount = 1;
    expect(verdict(data, 'C2')).toBe('PASS');
    row.durationP95 = 24.0001;
    expect(verdict(data, 'C2')).toBe('FAIL');
    row.durationP95 = 16;
    row.longFrameCount = 2;
    expect(verdict(data, 'C2')).toBe('FAIL');
  });
  it('C3 enforces 200 delivered keys and the arrival limit', () => {
    const data = closingGateFixture(),
      row = data.rows.find(
        (r) => r.lane === 'F' && r.id === 'type-flat-500-validate-nonburst',
      );
    if (!row) throw new Error('Fixture missing');
    row.validation.p95 = 33.4001;
    expect(verdict(data, 'C3')).toBe('FAIL');
    row.validation.p95 = 10;
    row.keys = 240;
    expect(verdict(data, 'C3')).toBe('FAIL');
    row.keys = 200;
    row.undelivered = 1;
    expect(verdict(data, 'C3')).toBe('FAIL');
  });
  it('C4 uses the dual vsync bound and leaves None and if rows report-only', () => {
    const data = closingGateFixture(),
      bound = data.bounds['mount-flat-500-always'].firstPainted;
    bound.upperBound = 1.2;
    bound.differenceUpperBound = 8.35;
    expect(verdict(data, 'C4')).toBe('PASS');
    bound.differenceUpperBound = 8.36;
    expect(verdict(data, 'C4')).toBe('FAIL');
    bound.upperBound = 1;
    for (const id of ['mount-flat-500-none', 'mount-if-flat-500-validate']) {
      data.bounds[id].firstPainted.upperBound = 9;
      data.bounds[id].firstPainted.differenceUpperBound = 99;
    }
    expect(verdict(data, 'C4')).toBe('PASS');
  });
  it('C5 gates synchronous reset, dual paint and settled validate resolution', () => {
    const data = closingGateFixture();
    data.bounds['reset-flat-500-same'].callDuration.upperBound = 1.11;
    expect(verdict(data, 'C5')).toBe('FAIL');
    data.bounds['reset-flat-500-same'].callDuration.upperBound = 1;
    data.bounds['rebuild-flat-500'].nextPainted.upperBound = 1.2;
    data.bounds['rebuild-flat-500'].nextPainted.differenceUpperBound = 2;
    expect(verdict(data, 'C5')).toBe('PASS');
    data.bounds['validate-flat-500-settled'].resolutionTime.upperBound = 1.11;
    expect(verdict(data, 'C5')).toBe('FAIL');
  });
  it('C6 checks each stream page rather than a pooled run count', () => {
    const data = closingGateFixture(),
      stream = data.pages['stream-0'].stream;
    if (!stream) throw new Error('Stream missing');
    stream.validationRuns = 13;
    expect(verdict(data, 'C6')).toBe('FAIL');
  });
  it('C7 propagates every original round-6 failure and uncertainty', () => {
    const data = closingGateFixture();
    data.ir6S[6].status = 'FAIL';
    expect(verdict(data, 'C7')).toBe('FAIL');
    data.ir6S[6].status = 'INDETERMINATE';
    expect(verdict(data, 'C7')).toBe('INDETERMINATE');
  });
  it('first-key rows cannot fail typing gates', () => {
    const data = closingGateFixture();
    for (const row of data.rows.filter((r) => r.id.startsWith('first-key-'))) {
      row.durationP95 = 999;
      row.longFrameCount = 999;
      row.undelivered = 999;
    }
    expect(['C1', 'C2', 'C3'].map((id) => verdict(data, id))).toEqual([
      'PASS',
      'PASS',
      'PASS',
    ]);
  });
});
