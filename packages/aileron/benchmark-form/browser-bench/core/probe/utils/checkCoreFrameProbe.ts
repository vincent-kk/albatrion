import { detectCoreFrameIntervalNominal } from '../../helpers/observeCoreOperation/utils/detectCoreFrameIntervalNominal';
import type { CoreFrameProbeResult } from '../frameProbeHarness';

/**
 * Validate measured observer evidence without changing the 16.7 ms UX budget.
 * @param result - Raw browser probe values, including cadence and raw/floor/net overhead in ms/s.
 * @returns Failures; an empty list requires net overhead ≤ 1 ms/s and floor ≤ 2.5 ms/s.
 */
export function checkCoreFrameProbe(result: CoreFrameProbeResult): string[] {
  const failures: string[] = [];
  const expect = (ok: boolean, text: string) => {
    if (!ok) failures.push(text);
  };
  expect(result.crossOriginIsolated, 'probe page is not cross-origin isolated');
  expect(result.busyGapMs >= 70, `busy rAF gap ${result.busyGapMs} ms < 70`);
  expect(
    (result.busyMaxLongTaskMs ?? 0) >= 70,
    `busy Long Task ${result.busyMaxLongTaskMs} ms < 70`,
  );
  expect(
    result.preRegistrationMaxLongTaskMs === null,
    'pre-registration task leaked into the window',
  );
  expect(
    (result.straddleMaxLongTaskMs ?? 0) >= 70,
    'straddling task original length < 70',
  );
  expect(
    result.straddleOverlapMs >= 25 && result.straddleOverlapMs <= 55,
    'straddling overlap is not about 40 ms',
  );
  expect(
    (result.lateMaxLongTaskMs ?? 0) >= 70,
    'takeRecords did not collect the late task',
  );
  const nominal = detectCoreFrameIntervalNominal(result.idleMedianGapMs);
  expect(
    nominal !== null && nominal === result.frameIntervalNominalMs,
    `frame interval ${result.idleMedianGapMs} ms disagrees with nominal ${result.frameIntervalNominalMs} ms`,
  );
  expect(
    Number.isFinite(result.idleOverheadMsPerSecond) &&
      result.idleOverheadMsPerSecond >= 0,
    'raw observer overhead is invalid',
  );
  expect(
    Number.isFinite(result.idleFloorMsPerSecond) &&
      result.idleFloorMsPerSecond >= 0 &&
      result.idleFloorMsPerSecond <= 2.5,
    `bare-loop floor ${result.idleFloorMsPerSecond} ms/s exceeds 2.5 or is invalid`,
  );
  const net = result.idleOverheadMsPerSecond - result.idleFloorMsPerSecond;
  expect(
    Number.isFinite(result.idleNetOverheadMsPerSecond) &&
      Math.abs(result.idleNetOverheadMsPerSecond - net) < 1e-9 &&
      net <= 1,
    `net observer overhead ${result.idleNetOverheadMsPerSecond} ms/s exceeds 1 or disagrees with raw - floor`,
  );
  return failures;
}
