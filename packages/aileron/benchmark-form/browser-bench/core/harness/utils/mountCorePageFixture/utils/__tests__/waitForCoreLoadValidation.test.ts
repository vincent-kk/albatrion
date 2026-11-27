import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import type {
  CoreObservationEnv,
  CoreValidationReport,
  CoreValidatorRecord,
} from '../../../../../types';
import { waitForCoreLoadValidation } from '../waitForCoreLoadValidation';

/** Timer-driven browser clock; no animation frame is needed to enforce the ceiling. */
const env: CoreObservationEnv = {
  now: () => Date.now(),
  requestAnimationFrame: vi.fn(),
  setTimeout: (callback, delayMs) => {
    setTimeout(callback, delayMs);
  },
};
/** Recorded load validation, shared read-only by these waiting scenarios. */
const run: CoreValidatorRecord = {
  seq: 1,
  kind: 'run',
  probeValue: '',
  startMs: 0,
  syncReturnMs: 0,
  settledMs: 0,
  ok: true,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
});
afterEach(() => {
  vi.useRealTimers();
});

it('accepts an already settled load run without scheduling a delay', async () => {
  await waitForCoreLoadValidation(
    { records: [run], pending: new Set() },
    [{ atMs: 0, probeError: true }],
    env,
  );
  expect(vi.getTimerCount()).toBe(0);
  expect(env.now()).toBe(0);
});

it('waits for the first load run even when nothing is pending yet', async () => {
  const records: CoreValidatorRecord[] = [];
  const settled = vi.fn();
  const waiting = waitForCoreLoadValidation(
    { records, pending: new Set() },
    [{ atMs: 0, probeError: true }],
    env,
  ).then(settled);
  await vi.advanceTimersByTimeAsync(40);
  expect(settled).not.toHaveBeenCalled();
  records.push(run);
  await vi.advanceTimersByTimeAsync(10);
  await waiting;
  expect(settled).toHaveBeenCalledOnce();
});

it('waits until every pending run settles', async () => {
  const pending = new Set([run]);
  const settled = vi.fn();
  const waiting = waitForCoreLoadValidation(
    { records: [run], pending },
    [{ atMs: 0, probeError: true }],
    env,
  ).then(settled);
  await vi.advanceTimersByTimeAsync(40);
  expect(settled).not.toHaveBeenCalled();
  pending.clear();
  await vi.advanceTimersByTimeAsync(10);
  await waiting;
  expect(settled).toHaveBeenCalledOnce();
});

it('does not release after a settled run until a report exists', async () => {
  const reports: CoreValidationReport[] = [];
  const settled = vi.fn();
  const waiting = waitForCoreLoadValidation(
    { records: [run], pending: new Set() },
    reports,
    env,
  ).then(settled);
  await vi.advanceTimersByTimeAsync(40);
  expect(settled).not.toHaveBeenCalled();
  reports.push({ atMs: 0, probeError: true });
  await vi.advanceTimersByTimeAsync(10);
  await waiting;
  expect(settled).toHaveBeenCalledOnce();
});

it.each(['missing-run', 'compile-only', 'pending-run', 'no-report'])(
  'fails %s at the 1000 ms ceiling without animation frames',
  async (state) => {
    const records =
      state === 'missing-run'
        ? []
        : [
            {
              ...run,
              kind:
                state === 'compile-only'
                  ? ('compile' as const)
                  : ('run' as const),
            },
          ];
    const pending = new Set(state === 'pending-run' ? records : []);
    const waiting = waitForCoreLoadValidation(
      { records, pending },
      state === 'no-report' ? [] : [{ atMs: 0, probeError: true }],
      env,
    );
    const rejected = expect(waiting).rejects.toThrow(
      'Core first-key load validation did not settle within 1000 ms',
    );
    await vi.advanceTimersByTimeAsync(999);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    await rejected;
    expect(vi.getTimerCount()).toBe(0);
  },
);
