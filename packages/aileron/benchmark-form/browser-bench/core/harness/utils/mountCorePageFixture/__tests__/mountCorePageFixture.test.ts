import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { getCoreFixture } from '../../../../../../fixtures/core/getCoreFixture';
import { afterCorePaint } from '../../../../helpers/afterCorePaint';
import { mountCoreFixture } from '../../../../helpers/mountCoreFixture/mountCoreFixture';
import type {
  CoreObservationEnv,
  CoreValidationReport,
  CoreValidatorRecord,
  MountedCoreFixture,
} from '../../../../types';
import { mountCorePageFixture } from '../../mountCorePageFixture';
import type { CoreWrappedValidator } from '../../observeCoreValidator/observeCoreValidator';

vi.mock('../../../../helpers/mountCoreFixture/mountCoreFixture', () => ({
  mountCoreFixture: vi.fn(),
}));
vi.mock('../../../../helpers/afterCorePaint', () => ({
  afterCorePaint: vi.fn(),
}));

/** The mocked mount never invokes this validator; its shape matches the registered plugin. */
const plugin: CoreWrappedValidator['plugin'] = {
  validator: {
    configure: vi.fn(),
    bind: vi.fn(),
    compile: () => () => [],
    compileGuard: () => () => true,
    release: vi.fn(),
    dialect: 'http://json-schema.org/draft-07/schema#',
  },
};

/** Clock used to distinguish setup delay from the measured driver interval. */
const env: CoreObservationEnv = {
  now: () => Date.now(),
  requestAnimationFrame: vi.fn(),
  setTimeout: (callback, delayMs) => {
    setTimeout(callback, delayMs);
  },
};
/** First load's completed run; no raw instrumentation enters a sample. */
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
  vi.spyOn(performance, 'now').mockImplementation(env.now);
  window.__coreFirstKey = vi.fn(async () => {
    vi.setSystemTime(Date.now() + 25);
  });
  vi.mocked(afterCorePaint).mockImplementation(async () => {
    vi.setSystemTime(Date.now() + 5);
  });
  vi.mocked(mountCoreFixture).mockImplementation(
    async (_container, fixture, _plugin, hooks) => {
      hooks.onRenderStart();
      hooks.onFirstPaint();
      if (fixture.id === 'first-key-flat-500-validate')
        expect(window.__coreFirstKey).toHaveBeenCalledOnce();
      return {
        durationMs: 0,
        currentHandle: vi.fn<MountedCoreFixture['currentHandle']>(),
      };
    },
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('keeps the immediate case driving at first paint with no load run', async () => {
  const observation = { begin: vi.fn(), stop: vi.fn(), records: [] };
  let firstKey = Promise.resolve(-1);
  await mountCorePageFixture(
    document.createElement('div'),
    getCoreFixture('first-key-flat-500-validate'),
    { plugin, observation: { records: [], pending: new Set() } },
    observation,
    [],
    env,
    (promise) => {
      firstKey = promise;
    },
  );
  expect(window.__coreFirstKey).toHaveBeenCalledOnce();
  expect(observation.begin).toHaveBeenCalledOnce();
  expect(await firstKey).toBe(30);
});

it('starts observation and duration only after load validation settles', async () => {
  const pending = new Set([run]);
  const reports: CoreValidationReport[] = [];
  const observation = { begin: vi.fn(), stop: vi.fn(), records: [] };
  const selected = {
    ...getCoreFixture('first-key-flat-500-validate'),
    id: 'first-key-flat-500-validate-after-load',
  };
  let firstKey = Promise.resolve(-1);
  await mountCorePageFixture(
    document.createElement('div'),
    selected,
    { plugin, observation: { records: [run], pending } },
    observation,
    reports,
    env,
    (promise) => {
      firstKey = promise;
    },
  );
  await vi.advanceTimersByTimeAsync(200);
  expect(window.__coreFirstKey).not.toHaveBeenCalled();
  expect(observation.begin).not.toHaveBeenCalled();
  pending.clear();
  reports.push({ atMs: env.now(), probeError: true });
  await vi.advanceTimersByTimeAsync(10);
  expect(await firstKey).toBe(30);
  expect(window.__coreFirstKey).toHaveBeenCalledOnce();
  expect(observation.begin).toHaveBeenCalledOnce();
});

it('rejects the sample without sending a key if load validation never runs', async () => {
  const observation = { begin: vi.fn(), stop: vi.fn(), records: [] };
  const selected = {
    ...getCoreFixture('first-key-flat-500-validate'),
    id: 'first-key-flat-500-validate-after-load',
  };
  let firstKey = Promise.resolve(-1);
  await mountCorePageFixture(
    document.createElement('div'),
    selected,
    { plugin, observation: { records: [], pending: new Set() } },
    observation,
    [],
    env,
    (promise) => {
      firstKey = promise;
    },
  );
  const rejected = expect(firstKey).rejects.toThrow(
    'Core first-key load validation did not settle within 1000 ms',
  );
  await vi.advanceTimersByTimeAsync(1000);
  await rejected;
  expect(window.__coreFirstKey).not.toHaveBeenCalled();
  expect(observation.begin).not.toHaveBeenCalled();
});
