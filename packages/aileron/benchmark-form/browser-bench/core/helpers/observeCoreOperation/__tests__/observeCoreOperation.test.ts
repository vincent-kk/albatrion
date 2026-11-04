import { describe, expect, it } from 'vitest';

import type { plugin } from '@canard/schema-form-ajv8-plugin';

import type { CoreInputRecord, CoreValidationReport } from '../../../types';
import { observeCoreOperation } from '../observeCoreOperation';
import { observeCoreValidator } from '../utils/observeCoreValidator';
import { createCoreFakeWorld } from './createCoreFakeWorld';

/** The fake validator always returns a promise; narrow the engine's union for the tests. */
const settled = (result: unknown): Promise<unknown> => {
  if (!(result instanceof Promise))
    throw new Error('fake validator must return a promise');
  return result;
};

/** Validator double: compile spends 3 ms, each run spends 2 ms and settles 10 ms later unless the value is in `rejecting`. */
function createFakeValidator(
  world: ReturnType<typeof createCoreFakeWorld>,
  rejecting: string[] = [],
) {
  const source: typeof plugin = {
    validator: {
      configure: () => {},
      bind: () => {},
      compileGuard: () => () => true,
      release: () => {},
      dialect: 'http://json-schema.org/draft-07/schema#',
      compile: () => {
        world.spend(3);
        return (data: unknown) => {
          world.spend(2);
          const value =
            typeof data === 'object' && data !== null && 'probe' in data
              ? String(data.probe)
              : '';
          return new Promise<null>((resolve, reject) => {
            world.schedule(world.env.now() + 10, () =>
              rejecting.includes(value)
                ? reject(new Error('validator rejected ' + value))
                : resolve(null),
            );
          });
        };
      },
    },
  };
  return observeCoreValidator(source, '/probe', world.env);
}

describe('observeCoreOperation', () => {
  it('settles a validated mount once the probe marker shows the load error', async () => {
    const world = createCoreFakeWorld();
    const validator = createFakeValidator(world);
    const reports: CoreValidationReport[] = [];
    let start = 0;
    const result = await world.runUntil(
      observeCoreOperation(
        {
          operation: 'mount',
          validation: true,
          loadValue: 'x',
          validator: validator.observation,
          marker: world.marker,
          reports,
          longTasks: world.longTasks(
            () => [
              { startTime: start - 200, duration: 90 },
              { startTime: start - 30, duration: 80 },
              { startTime: start + 10, duration: 80 },
            ],
            () => [{ startTime: start + 20, duration: 60 }],
          ),
          async execute() {
            start = world.env.now();
            const validate = validator.plugin.validator.compile({});
            world.schedule(start + 40, () => {
              void settled(validate({ probe: 'x' })).then(() => {
                world.schedule(world.env.now() + 5, () =>
                  world.marker.set('1'),
                );
              });
            });
            world.schedule(start + 60, () =>
              reports.push({ atMs: world.env.now(), probeError: true }),
            );
            await new Promise<void>((resolve) =>
              world.env.setTimeout(resolve, 20),
            );
            return { startMs: start, durationMs: 20, writes: [] };
          },
        },
        world.env,
      ),
    );
    expect(result.startMs).toBe(start);
    expect(result.metrics.durationMs).toBe(20);
    expect(result.metrics.blockingMs).toBeNull();
    expect(result.metrics.firstWriteMs).toBeNull();
    expect(result.metrics.validatorSettledMs).toBe(52);
    expect(result.metrics.feedbackCommittedMs).toBe(57);
    expect(result.metrics.validationReportedMs).toBe(60);
    expect(result.metrics.preFrameValidatorMs).toBe(3);
    expect(result.metrics.postFrameValidatorMs).toBe(2);
    expect(result.metrics.frameIntervalMs).toBe(16);
    expect(result.metrics.frameIntervalNominalMs).toBe(1000 / 60);
    expect(result.metrics.frames).toBeGreaterThanOrEqual(2);
    expect(result.metrics.feedbackClasses).toEqual({
      exact: 0,
      censored: 0,
      noChange: 0,
      superseded: 0,
    });
    expect(result.endMs - start).toBeGreaterThanOrEqual(57 + 32);
    expect(result.endMs - start).toBeLessThanOrEqual(57 + 50 + 32 + 16);
    const relativeEnd = result.endMs - start;
    expect(result.metrics.maxLongTaskMs).toBe(80);
    expect(result.metrics.longTaskOverlapMs).toBe(
      50 + Math.min(80, relativeEnd - 10) + Math.min(60, relativeEnd - 20),
    );
    expect(result.writes).toEqual([]);
  });

  it('attributes typing writes by probe value and waits for a run scheduled after the last key', async () => {
    const world = createCoreFakeWorld();
    const validator = createFakeValidator(world);
    const values = ['a', 'ab', 'abc', 'abcd'];
    const records: CoreInputRecord[] = [];
    let start = 0;
    const result = await world.runUntil(
      observeCoreOperation(
        {
          operation: 'type',
          validation: true,
          loadValue: null,
          validator: validator.observation,
          marker: world.marker,
          reports: [],
          longTasks: world.longTasks(() => []),
          async execute() {
            start = world.env.now();
            const validate = validator.plugin.validator.compile({});
            const run = (value: string, then?: () => void) =>
              void settled(validate({ probe: value })).then(then);
            for (const [index, value] of values.entries()) {
              const at = start + index * 100;
              world.schedule(at, () =>
                records.push({
                  start: at,
                  durationMs: 1,
                  trusted: true,
                  value,
                }),
              );
            }
            world.schedule(start + 5, () =>
              run('a', () =>
                world.schedule(world.env.now() + 2, () =>
                  world.marker.set('1'),
                ),
              ),
            );
            world.schedule(start + 205, () => run('ab'));
            world.schedule(start + 420, () =>
              run('abcd', () =>
                world.schedule(world.env.now() + 2, () =>
                  world.marker.set('0'),
                ),
              ),
            );
            await new Promise<void>((resolve) =>
              world.env.setTimeout(resolve, 301),
            );
            return { startMs: start, durationMs: 1, writes: records };
          },
        },
        world.env,
      ),
    );
    expect(result.writes.map((write) => write.feedbackClass)).toEqual([
      'exact',
      'censored',
      'superseded',
      'exact',
    ]);
    expect(result.writes.map((write) => write.validatorSettledMs)).toEqual([
      17,
      117,
      null,
      132,
    ]);
    expect(result.writes.map((write) => write.feedbackCommittedMs)).toEqual([
      19,
      null,
      null,
      134,
    ]);
    expect(result.writes.map((write) => write.coalesced)).toEqual([
      false,
      true,
      false,
      false,
    ]);
    expect(result.metrics.blockingMs).toBe(1);
    expect(result.metrics.firstWriteMs).toBe(1);
    expect(result.metrics.validatorSettledMs).toBe((117 + 132) / 2);
    expect(result.metrics.feedbackCommittedMs).toBe(134);
    expect(result.metrics.feedbackClasses).toEqual({
      exact: 2,
      censored: 1,
      noChange: 0,
      superseded: 1,
    });
    expect(result.metrics.coalescedWrites).toBe(1);
    expect(result.metrics.validationReportedMs).toBeNull();
    expect(result.endMs - start).toBeGreaterThanOrEqual(434 + 32);
  });

  it('completes a none sample without validator or marker conditions', async () => {
    const world = createCoreFakeWorld();
    const validator = createFakeValidator(world);
    let start = 0;
    const result = await world.runUntil(
      observeCoreOperation(
        {
          operation: 'mount',
          validation: false,
          loadValue: null,
          validator: validator.observation,
          marker: { transitions: [], state: () => null, count: () => 0 },
          reports: [],
          longTasks: world.longTasks(() => []),
          async execute() {
            start = world.env.now();
            await new Promise<void>((resolve) =>
              world.env.setTimeout(resolve, 20),
            );
            return { startMs: start, durationMs: 20, writes: [] };
          },
        },
        world.env,
      ),
    );
    expect(result.metrics.validatorSettledMs).toBeNull();
    expect(result.metrics.feedbackCommittedMs).toBeNull();
    expect(result.metrics.validationReportedMs).toBeNull();
    expect(result.metrics.maxLongTaskMs).toBeNull();
    expect(result.metrics.longTaskOverlapMs).toBe(0);
    expect(result.endMs - start).toBeLessThanOrEqual(20 + 50 + 32 + 16);
  });

  it('records a rejected run as a failed call and still settles on the next verdict', async () => {
    const world = createCoreFakeWorld();
    const validator = createFakeValidator(world, ['bad']);
    let start = 0;
    const result = await world.runUntil(
      observeCoreOperation(
        {
          operation: 'mount',
          validation: true,
          loadValue: 'x',
          validator: validator.observation,
          marker: world.marker,
          reports: [],
          longTasks: world.longTasks(() => []),
          async execute() {
            start = world.env.now();
            const validate = validator.plugin.validator.compile({});
            world.schedule(start + 10, () => {
              settled(validate({ probe: 'bad' })).catch(() => {});
            });
            world.schedule(start + 40, () => {
              void settled(validate({ probe: 'x' })).then(() =>
                world.marker.set('1'),
              );
            });
            return { startMs: start, durationMs: 0, writes: [] };
          },
        },
        world.env,
      ),
    );
    const failed = validator.observation.records.filter((record) => !record.ok);
    expect(failed).toHaveLength(1);
    expect(failed[0].error).toContain('validator rejected bad');
    expect(result.metrics.validatorSettledMs).toBe(52);
    expect(validator.observation.pending.size).toBe(0);
  });

  it('falls back to the 250 ms quiet timer when frames stall', async () => {
    const world = createCoreFakeWorld();
    const validator = createFakeValidator(world);
    let start = 0;
    const result = await world.runUntil(
      observeCoreOperation(
        {
          operation: 'mount',
          validation: true,
          loadValue: 'x',
          validator: validator.observation,
          marker: world.marker,
          reports: [],
          longTasks: world.longTasks(() => []),
          async execute() {
            start = world.env.now();
            world.stallFrames();
            const validate = validator.plugin.validator.compile({});
            world.schedule(start + 10, () => {
              void settled(validate({ probe: 'x' })).then(() =>
                world.marker.set('1'),
              );
            });
            return { startMs: start, durationMs: 0, writes: [] };
          },
        },
        world.env,
      ),
    );
    expect(result.metrics.feedbackCommittedMs).toBe(22);
    expect(result.endMs - start).toBeGreaterThanOrEqual(22 + 250);
    expect(result.endMs - start).toBeLessThanOrEqual(22 + 50 + 250);
    expect(result.metrics.frames).toBe(0);
  });

  it('fails the sample at the independent 5000 ms cap', async () => {
    const world = createCoreFakeWorld();
    const validator = createFakeValidator(world);
    await expect(
      world.runUntil(
        observeCoreOperation(
          {
            operation: 'mount',
            validation: true,
            loadValue: 'x',
            validator: validator.observation,
            marker: world.marker,
            reports: [],
            longTasks: world.longTasks(() => []),
            async execute() {
              return { startMs: world.env.now(), durationMs: 0, writes: [] };
            },
          },
          world.env,
        ),
      ),
    ).rejects.toThrow('5000');
  });

  it('fails calibration when the empty rAF interval is neither a 60 Hz nor a 120 Hz period', async () => {
    const world = createCoreFakeWorld(25);
    const validator = createFakeValidator(world);
    await expect(
      world.runUntil(
        observeCoreOperation(
          {
            operation: 'mount',
            validation: false,
            loadValue: null,
            validator: validator.observation,
            marker: world.marker,
            reports: [],
            longTasks: world.longTasks(() => []),
            async execute() {
              return { startMs: world.env.now(), durationMs: 0, writes: [] };
            },
          },
          world.env,
        ),
      ),
    ).rejects.toThrow('frame interval');
  });
});
