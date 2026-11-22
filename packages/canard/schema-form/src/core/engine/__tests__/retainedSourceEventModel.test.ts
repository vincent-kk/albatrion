import { expect, it } from 'vitest';

import { createSeedSampler } from './fixtures/createSeedSampler';
import { expectRetainedSourceEvents } from './fixtures/expectRetainedSourceEvents';
import { observeRetainedSourceEvents } from './fixtures/observeRetainedSourceEvents';
import {
  CALLS,
  ORDERS,
  POLICIES,
  ROUTES,
  SHAPES,
  TIMINGS,
  Y,
} from './fixtures/retainedSourceModelCases';
import type { Case, Step } from './fixtures/retainedSourceModelCases';

const GRID = SHAPES.flatMap((shape) =>
  TIMINGS.flatMap((timing) =>
    ORDERS.flatMap((order) =>
      POLICIES.map((policy) => ({ shape, timing, order, policy })),
    ),
  ),
);

const EXTRA_CASES: readonly Case[] = [
  {
    shape: 'array',
    timing: 'same wave',
    order: 'fill then name',
    policy: 'keep',
    arrayInput: 'sparse',
    groupWidth: 2,
  },
  {
    shape: 'array',
    timing: 'next wave',
    order: 'fill then name',
    policy: 'keep',
    arrayInput: 'empty',
    groupWidth: 2,
  },
  {
    shape: 'held',
    timing: 'same wave',
    order: 'name then fill',
    policy: 'callback',
    groupWidth: 2,
  },
];
const CASES: readonly Case[] = [...GRID, ...EXTRA_CASES];

const classOf = ({
  shape,
  timing,
  order,
  policy,
  arrayInput,
  groupWidth,
}: Case) => [shape, timing, order, policy, arrayInput, groupWidth].join('/');

const sampler = createSeedSampler(CASES.length * 4, CASES.map(classOf), 1);

it(`selects the same retained sources from independent events for ${sampler.label}`, () => {
  const reached = new Set<string>();
  for (let seed = 1; sampler.has(seed); seed++) {
    const scenario = CASES[(seed - 1) % CASES.length];
    const key = classOf(scenario);
    if (!sampler.accept(key)) continue;
    const model = expectRetainedSourceEvents(scenario, seed);
    for (const route of ROUTES)
      for (const call of CALLS) {
        const actual = observeRetainedSourceEvents(scenario, seed, route, call);
        const id = `seed=${seed} ${key} ${route} ${call}`;
        expect(actual.retained, id).toStrictEqual(model);
        expect(actual.peer, id).toBe(
          scenario.groupWidth === 2 ? 'peer' : undefined,
        );
        expect(actual.didClose, id).toBe(true);
        if (scenario.shape === 'held') {
          expect(actual.heldBefore, id).toBe('held-initial');
          if (
            scenario.order === 'fill then name' &&
            scenario.timing === 'same wave'
          )
            reached.add('deep omission with an already inactive named sibling');
        } else if (
          scenario.shape === 'array' &&
          scenario.order === 'fill then name' &&
          scenario.timing === 'same wave' &&
          scenario.policy === 'keep'
        ) {
          expect(actual.enteredNamedItem, id).toBe(false);
          expect(actual.retained[Y], id).toHaveLength(1);
          reached.add(
            'grow a named array position before its occurrence exists',
          );
        }
      }
  }
  expect(sampler.shortfall()).toEqual([]);
  expect([...reached].sort()).toEqual([
    'deep omission with an already inactive named sibling',
    'grow a named array position before its occurrence exists',
  ]);
}, 120_000);

const sequenceClasses = ['fill/name/fill', 'name/fill/name'] as const;
const sequences = createSeedSampler(48, sequenceClasses, 2);

it(`matches bounded mixed write sequences for ${sequences.label}`, () => {
  for (let seed = 1; sequences.has(seed); seed++) {
    const kind = sequenceClasses[seed % sequenceClasses.length];
    if (!sequences.accept(kind)) continue;
    const steps: Step[] =
      kind === 'fill/name/fill'
        ? ['fill', 'name', 'fill']
        : ['name', 'fill', 'name'];
    let state = (seed * 2654435761) >>> 0;
    const suffixLength = seed % 4;
    for (let index = 0; index < suffixLength; index++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      steps.push(state >>> 31 ? 'name' : 'fill');
    }
    const scenario: Case = {
      shape: seed % 3 === 0 ? 'held' : 'scalar',
      timing: seed % 5 < 2 ? 'same wave' : 'next wave',
      order: kind === 'fill/name/fill' ? 'fill then name' : 'name then fill',
      policy: POLICIES[seed % POLICIES.length],
    };
    const model = expectRetainedSourceEvents(scenario, seed, steps);
    for (const route of ROUTES)
      for (const call of CALLS) {
        const actual = observeRetainedSourceEvents(
          scenario,
          seed,
          route,
          call,
          steps,
        );
        const id = `seed=${seed} ${steps.join('/')}, ${route} / ${call}`;
        expect(actual.retained, id).toStrictEqual(model);
        expect(actual.didClose, id).toBe(true);
      }
  }
  expect(sequences.shortfall()).toEqual([]);
}, 120_000);
