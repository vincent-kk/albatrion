import lodashModule from 'lodash';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce, equals, merge, stableEquals, throttle } from '@/common-utils';

// Seeded generator (mulberry32) so a failure reproduces.
const createRandom = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Step = { gap: number; arg: number };

const createSchedule = (random: () => number, length: number): Step[] =>
  Array.from({ length }, (_, arg) => ({
    gap: Math.floor(random() * 250),
    arg,
  }));

describe('debounce against lodash debounce (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const run = (
    make: (fn: (arg: number) => void) => (arg: number) => void,
    schedule: Step[],
  ) => {
    const start = Date.now();
    const runs: string[] = [];
    const wrapped = make((arg) => runs.push(`${Date.now() - start}:${arg}`));
    for (const step of schedule) {
      vi.advanceTimersByTime(step.gap);
      wrapped(step.arg);
    }
    vi.advanceTimersByTime(1000);
    return runs;
  };

  for (const options of [
    { leading: false, trailing: true },
    { leading: true, trailing: false },
    { leading: true, trailing: true },
  ]) {
    it(`same invocations for ${JSON.stringify(options)} over 300 seeded schedules`, () => {
      const lodash = lodashModule.runInContext();
      const random = createRandom(4242);
      const mismatches: string[] = [];
      for (let trial = 0; trial < 300 && mismatches.length < 3; trial++) {
        const schedule = createSchedule(random, 12);
        const ours = run((fn) => debounce(fn, 100, options), schedule);
        const theirs = run((fn) => lodash.debounce(fn, 100, options), schedule);
        if (ours.join() !== theirs.join())
          mismatches.push(
            `${JSON.stringify(schedule.map((s) => s.gap))} ours=${ours} lodash=${theirs}`,
          );
      }
      expect(mismatches).toEqual([]);
    });
  }
});

describe('equals and stableEquals against lodash isEqual on JSON data', () => {
  const createValue = (random: () => number, depth: number): unknown => {
    const pick = random();
    if (depth > 3 || pick < 0.45) {
      const primitives = [0, -0, 1, 'a', '', true, false, null, 1.5, 'b'];
      return primitives[Math.floor(random() * primitives.length)];
    }
    if (pick < 0.7)
      return Array.from({ length: Math.floor(random() * 4) }, () =>
        createValue(random, depth + 1),
      );
    const object: Record<string, unknown> = {};
    for (let i = Math.floor(random() * 4); i > 0; i--)
      object[['a', 'b', 'c', 'd'][Math.floor(random() * 4)]] = createValue(
        random,
        depth + 1,
      );
    return object;
  };

  it('agree with lodash on 5000 seeded pairs (including near-copies)', () => {
    const random = createRandom(99);
    const mismatches: string[] = [];
    for (let i = 0; i < 5000 && mismatches.length < 3; i++) {
      const left = createValue(random, 0);
      const right =
        random() < 0.5
          ? JSON.parse(JSON.stringify(left) ?? 'null')
          : createValue(random, 0);
      const expected = lodashModule.isEqual(left, right);
      const actual = [equals(left, right), stableEquals(left, right)];
      if (actual[0] !== expected || actual[1] !== expected)
        mismatches.push(
          `${JSON.stringify(left)} vs ${JSON.stringify(right)}: lodash=${expected} equals=${actual[0]} stableEquals=${actual[1]}`,
        );
    }
    expect(mismatches).toEqual([]);
  });
});

describe('diagnostic: merge against lodash merge on JSON data', () => {
  it('agree on 3000 seeded pairs of plain JSON objects', () => {
    const random = createRandom(7);
    const createJson = (depth: number): unknown => {
      const pick = random();
      if (depth > 2 || pick < 0.4) return [1, 'x', null, true][Math.floor(random() * 4)];
      if (pick < 0.65)
        return Array.from({ length: Math.floor(random() * 3) }, () => createJson(depth + 1));
      const object: Record<string, unknown> = {};
      for (let i = Math.floor(random() * 3); i > 0; i--)
        object[['a', 'b', 'c'][Math.floor(random() * 3)]] = createJson(depth + 1);
      return object;
    };
    const mismatches: string[] = [];
    for (let i = 0; i < 3000 && mismatches.length < 3; i++) {
      const target = { root: createJson(0) };
      const source = { root: createJson(0) };
      const ours = merge(JSON.parse(JSON.stringify(target)), JSON.parse(JSON.stringify(source)));
      const theirs = lodashModule.merge(
        JSON.parse(JSON.stringify(target)),
        JSON.parse(JSON.stringify(source)),
      );
      if (JSON.stringify(ours) !== JSON.stringify(theirs))
        mismatches.push(
          `${JSON.stringify(target)} + ${JSON.stringify(source)}: ours=${JSON.stringify(ours)} lodash=${JSON.stringify(theirs)}`,
        );
    }
    expect(mismatches).toEqual([]);
  });
});

describe('diagnostic: throttle against lodash throttle (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('classifies differences over 300 seeded schedules (leading and trailing)', () => {
    const lodash = lodashModule.runInContext();
    const random = createRandom(31337);
    const kinds = new Map<string, number>();
    let example = '';
    for (let trial = 0; trial < 300; trial++) {
      const schedule = createSchedule(random, 12);
      const collect = (make: (fn: (arg: number) => void) => (arg: number) => void) => {
        const start = Date.now();
        const runs: Array<[number, number]> = [];
        const wrapped = make((arg) => runs.push([Date.now() - start, arg]));
        for (const step of schedule) {
          vi.advanceTimersByTime(step.gap);
          wrapped(step.arg);
        }
        vi.advanceTimersByTime(1000);
        return runs;
      };
      const ours = collect((fn) => throttle(fn, 100));
      const theirs = collect((fn) => lodash.throttle(fn, 100));
      if (JSON.stringify(ours) === JSON.stringify(theirs)) continue;
      // Largest number of our runs inside any half-open 100ms interval.
      let densest = 0;
      for (const [time] of ours)
        densest = Math.max(densest, ours.filter(([t]) => t >= time && t < time + 100).length);
      const kind = `densest=${densest}`;
      kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
      if (densest > 2 && !example)
        example = `${JSON.stringify(schedule.map((s) => s.gap))} ours=${JSON.stringify(ours)} lodash=${JSON.stringify(theirs)}`;
    }
    expect({ kinds: Object.fromEntries(kinds), example }).toEqual({ kinds: {}, example: '' });
  });
});
