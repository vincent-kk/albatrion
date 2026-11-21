import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';
import { createSeedSampler } from './fixtures/createSeedSampler';

const POLICIES = ['keep', 'unset', 'declaration', 'callback'] as const;
const SHAPES = ['scalar', 'array', 'held'] as const;
const TIMINGS = ['same wave', 'next wave'] as const;
const ORDERS = ['fill then name', 'name then fill'] as const;
const ROUTES = ['own', 'parent', 'virtual'] as const;
const CALLS = ['setter', 'merge', 'batch', 'nested'] as const;

type Policy = (typeof POLICIES)[number];
type Shape = (typeof SHAPES)[number];
type Timing = (typeof TIMINGS)[number];
type Order = (typeof ORDERS)[number];
type Route = (typeof ROUTES)[number];
type Call = (typeof CALLS)[number];
type Step = 'fill' | 'name';
type Channel = '/o/n/m/y' | '/o/n/m/held' | '/o/z';
type Source = string | readonly (string | undefined)[];

type Event =
  | { kind: 'name'; channel: Channel; value: Source }
  | { kind: 'fill'; channel: Channel }
  | { kind: 'resize'; length: number; items?: readonly (string | undefined)[] }
  | { kind: 'close'; policy: Policy; resolved: Source };

interface Case {
  readonly shape: Shape;
  readonly timing: Timing;
  readonly order: Order;
  readonly policy: Policy;
  readonly arrayInput?: 'dense' | 'sparse' | 'empty';
  readonly groupWidth?: 2;
}

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

const Y = '/o/n/m/y';
const HELD = '/o/n/m/held';
const Z = '/o/z';

const source = (shape: Shape, value: string): Source =>
  shape === 'array' ? [value] : value;

/** Interpret settlement events before constructing any product call. */
const evaluate = (
  initial: Map<Channel, Source>,
  events: readonly Event[],
): Record<string, Source> => {
  const selected = new Map(initial);
  const original = initial.get(Y);
  const originalArray = Array.isArray(original) ? original : undefined;
  let generation = 0;
  let workingLength = originalArray?.length ?? 0;
  let retainedLength = workingLength;
  let selectedGeneration = generation;
  const items = new Map<string, string>();
  originalArray?.forEach((value, index) => {
    if (value !== undefined) items.set(`0:${index}`, value);
  });
  for (const event of events)
    switch (event.kind) {
      case 'name':
        selected.set(event.channel, event.value);
        break;
      case 'fill': {
        const baseline = initial.get(event.channel);
        if (baseline === undefined) selected.delete(event.channel);
        else selected.set(event.channel, baseline);
        break;
      }
      case 'resize':
        if (event.items === undefined) {
          workingLength = 0;
          retainedLength = originalArray?.length ?? 0;
          selectedGeneration = -1;
        } else {
          if (workingLength < event.length) generation++;
          workingLength = retainedLength = event.length;
          selectedGeneration = generation;
          for (let index = 0; index < event.length; index++) {
            const value = event.items[index];
            const key = `${generation}:${index}`;
            if (value === undefined) items.delete(key);
            else items.set(key, value);
          }
        }
        break;
      case 'close':
        if (event.policy === 'unset') selected.delete(Y);
        else if (event.policy !== 'keep') selected.set(Y, event.resolved);
        else if (originalArray)
          selected.set(
            Y,
            Array.from({ length: retainedLength }, (_, index) =>
              selectedGeneration === -1
                ? originalArray[index]
                : items.get(`${selectedGeneration}:${index}`),
            ),
          );
        break;
    }
  return Object.fromEntries(selected);
};

const defaultSteps = (order: Order): readonly Step[] =>
  order === 'fill then name' ? ['fill', 'name'] : ['name', 'fill'];

const expected = (
  { shape, order, policy, arrayInput }: Case,
  seed: number,
  steps = defaultSteps(order),
) => {
  const initial = new Map<Channel, Source>([
    [Y, source(shape, 'initial')],
    [Z, 'initial'],
  ]);
  if (shape === 'held') initial.set(HELD, 'held-initial');
  const items =
    arrayInput === 'empty'
      ? []
      : [arrayInput === 'sparse' ? undefined : 'y' + seed];
  const named: Event =
    shape === 'array'
      ? { kind: 'resize', length: items.length, items }
      : { kind: 'name', channel: Y, value: 'y' + seed };
  const fill: Event =
    shape === 'array'
      ? { kind: 'resize', length: 0 }
      : { kind: 'fill', channel: Y };
  const events = steps.map<Event>((step) => (step === 'name' ? named : fill));
  if (shape === 'held' && steps.includes('name'))
    events.push({ kind: 'name', channel: HELD, value: 'held' + seed });
  events.push(
    { kind: 'name', channel: Z, value: 'last' },
    { kind: 'close', policy, resolved: source(shape, 'resolved') },
  );
  return evaluate(initial, events);
};

const observe = (
  { shape, timing, order, policy, arrayInput, groupWidth }: Case,
  seed: number,
  route: Route,
  call: Call,
  steps = defaultSteps(order),
) => {
  const array = shape === 'array';
  const held = shape === 'held';
  const value = 'y' + seed;
  const heldValue = 'held' + seed;
  const itemInputs: string[] = [];
  const nextValue =
    arrayInput === 'sparse'
      ? new Array<string>(1)
      : arrayInput === 'empty'
        ? []
        : source(shape, value);
  const resolve = source(shape, 'resolved');
  const controls =
    policy === 'unset'
      ? { unsetOnInactive: true }
      : policy === 'declaration'
        ? { inactiveValue: () => resolve }
        : {};
  const name = (z: string) => {
    const m = { y: nextValue, ...(held ? { held: heldValue } : {}) };
    const whole = { z, n: { m } };
    if (route === 'virtual')
      return { '../group': groupWidth === 2 ? [whole, 'peer'] : [whole] };
    if (route === 'parent')
      return {
        '../o': whole,
        ...(groupWidth === 2 ? { '../peer': 'peer' } : {}),
      };
    return {
      '../o/z': z,
      ...(groupWidth === 2 ? { '../peer': 'peer' } : {}),
      '../o/n/m/y': nextValue,
      ...(held ? { '../o/n/m/held': heldValue } : {}),
    };
  };
  const omit = (z: string) => ({ '../o': { z } });
  const marker = (index: number) =>
    index === steps.length - 1 ? 'last' : 'phase' + index;
  const read = (index: number) =>
    (steps[index] === 'name' ? name : omit)(marker(index));
  const transitions: Record<string, AuthoredSchema> = {};
  for (let index = 1; index < steps.length; index++) {
    const field = 'wave' + index;
    transitions[field] = {
      type: 'boolean',
      controls: {
        derived: `/o/z === "${marker(index - 1)}" ? true : /${field}`,
        injectTo: (input) =>
          input
            ? {
                ...read(index),
                ...(timing === 'same wave' && index === steps.length - 1
                  ? { '../on': false }
                  : {}),
              }
            : {},
      },
    };
  }
  const y: AuthoredSchema = array
    ? {
        type: 'array',
        controls,
        items: {
          type: 'string',
          controls: {
            injectTo: (input) => {
              if (typeof input === 'string') itemInputs.push(input);
              return {};
            },
          },
        },
      }
    : { type: 'string', controls };
  const schema: AuthoredSchema = {
    type: 'object',
    options: {
      virtual: { group: { fields: groupWidth === 2 ? ['o', 'peer'] : ['o'] } },
    },
    properties: {
      on: { type: 'boolean' },
      peer: { type: 'string' },
      start: {
        type: 'boolean',
        controls: { injectTo: (input) => (input ? read(0) : {}) },
      },
      o: {
        type: 'object',
        controls: { active: '/on === true' },
        properties: {
          z: { type: 'string' },
          n: {
            type: 'object',
            properties: {
              m: {
                type: 'object',
                properties: {
                  y,
                  ...(held
                    ? {
                        held: {
                          type: 'string',
                          controls: { active: '/hold === true' },
                        },
                      }
                    : {}),
                },
              },
            },
          },
        },
      },
      hold: { type: 'boolean' },
      ...transitions,
      ...(timing === 'next wave'
        ? {
            third: {
              type: 'boolean',
              controls: {
                derived: '/o/z === "last" ? true : /third',
                injectTo: (input) => (input ? { '../on': false } : {}),
              },
            },
          }
        : {}),
    },
  };
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: {
      on: true,
      o: {
        z: 'initial',
        n: {
          m: {
            y: source(shape, 'initial'),
            ...(held ? { held: 'held-initial' } : {}),
          },
        },
      },
    },
    validationMode: ValidationMode.None,
  });
  if (policy === 'callback') root.find(Y)!.onInactive(() => resolve);
  const heldBefore = root.inactiveValues.find(
    ({ path }) => path === HELD,
  )?.value;
  const write = () => root.find('/start')!.setValue(true);
  if (call === 'setter') write();
  else if (call === 'merge') root.setValue({ start: true }, WriteOption.Merge);
  else if (call === 'batch') root.batch(write);
  else root.batch(() => root.batch(write));
  return {
    retained: Object.fromEntries(
      root.inactiveValues.map(({ path, value }) => [path, value]),
    ),
    didClose: !root.find('/o'),
    heldBefore,
    enteredNamedItem: itemInputs.includes(value),
    peer: root.find('/peer')!.value,
  };
};

const sampler = createSeedSampler(CASES.length * 4, CASES.map(classOf), 1);

it(`selects the same retained sources from independent events for ${sampler.label}`, () => {
  const reached = new Set<string>();
  for (let seed = 1; sampler.has(seed); seed++) {
    const scenario = CASES[(seed - 1) % CASES.length];
    const key = classOf(scenario);
    if (!sampler.accept(key)) continue;
    const model = expected(scenario, seed);
    for (const route of ROUTES)
      for (const call of CALLS) {
        const actual = observe(scenario, seed, route, call);
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
    const model = expected(scenario, seed, steps);
    for (const route of ROUTES)
      for (const call of CALLS) {
        const actual = observe(scenario, seed, route, call, steps);
        const id = `seed=${seed} ${steps.join('/')}, ${route} / ${call}`;
        expect(actual.retained, id).toStrictEqual(model);
        expect(actual.didClose, id).toBe(true);
      }
  }
  expect(sequences.shortfall()).toEqual([]);
}, 120_000);
