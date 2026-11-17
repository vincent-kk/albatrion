import { describe, expect, it } from 'vitest';

import type { CoreFrameProbeResult } from '../../frameProbeHarness';
import { checkCoreFrameProbe } from '../checkCoreFrameProbe';

/** Valid 120 Hz probe evidence with separate raw, floor and net overhead. */
const evidence: CoreFrameProbeResult = {
  crossOriginIsolated: true,
  busyGapMs: 80,
  busyMaxLongTaskMs: 80,
  preRegistrationDelivered: false,
  preRegistrationMaxLongTaskMs: null,
  straddleMaxLongTaskMs: 80,
  straddleOverlapMs: 40,
  lateMaxLongTaskMs: 80,
  idleMedianGapMs: 8.34,
  frameIntervalNominalMs: 1000 / 120,
  idleOverheadMsPerSecond: 2.4,
  idleFloorMsPerSecond: 1.6,
  idleNetOverheadMsPerSecond: 0.8,
};

describe('checkCoreFrameProbe', () => {
  it('accepts visible 120 Hz cadence and net overhead within the bounded floor', () => {
    expect(checkCoreFrameProbe(evidence)).toEqual([]);
  });

  it('rejects raw 3.0 ms/s even when floor 2.9 leaves net 0.1 ms/s', () => {
    expect(
      checkCoreFrameProbe({
        ...evidence,
        idleOverheadMsPerSecond: 3,
        idleFloorMsPerSecond: 2.9,
        idleNetOverheadMsPerSecond: 0.1,
      }),
    ).toContainEqual(expect.stringContaining('raw observer overhead'));
  });

  it('enforces the raw bound independently when floor and net both pass', () => {
    expect(
      checkCoreFrameProbe({
        ...evidence,
        idleOverheadMsPerSecond: 3,
        idleFloorMsPerSecond: 2.3,
        idleNetOverheadMsPerSecond: 0.7,
      }),
    ).toContainEqual(expect.stringContaining('raw observer overhead'));
  });

  it('rejects a bare-loop floor over 2.5 ms/s even when the net is small', () => {
    expect(
      checkCoreFrameProbe({ ...evidence, idleFloorMsPerSecond: 2.6 }),
    ).toContainEqual(expect.stringContaining('floor'));
  });

  it('rejects net overhead over 1 ms/s and inconsistent net evidence', () => {
    expect(
      checkCoreFrameProbe({ ...evidence, idleNetOverheadMsPerSecond: 1.1 }),
    ).toContainEqual(expect.stringContaining('net'));
  });

  it('rejects an unsupported cadence and a nominal period inconsistent with the gap', () => {
    expect(
      checkCoreFrameProbe({ ...evidence, idleMedianGapMs: 25 }),
    ).toContainEqual(expect.stringContaining('interval'));
    expect(
      checkCoreFrameProbe({ ...evidence, frameIntervalNominalMs: 1000 / 60 }),
    ).toContainEqual(expect.stringContaining('interval'));
  });
});
