import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';

const strings = { type: 'array', items: { type: 'string' } } as const;

const schema = {
  type: 'object',
  properties: {
    list: strings,
    o: { type: 'object', properties: { a: { type: 'string' }, list: strings } },
    m: { type: 'array', items: strings },
    t: {
      type: 'array',
      prefixItems: [{ type: 'string' }, { type: 'string' }],
      items: { type: 'string' },
    },
  },
} as const satisfies AuthoredSchema;

type Scenario = {
  /** Address the first call writes as a whole */
  host: string;
  /** Whole value written at `host` */
  hostValue: unknown;
  /** Item, or item descendant, the second call writes */
  target: string;
};

/**
 * Write a whole array or one of its ancestors, then write through an item reference taken
 * before it, in one batch or as separate calls.
 * @param scenario - Addresses and the first call's value
 * @param batched - Whether both calls run inside one `root.batch`
 * @param input - Second call's input; an updater records what it receives
 * @returns The stored observations that must not depend on batching, and the updater inputs
 */
const observe = (
  { host, hostValue, target }: Scenario,
  batched: boolean,
  input: 'value' | 'updater' = 'value',
) => {
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: {
      list: ['x', 'y'],
      o: { a: 'A', list: ['x', 'y'] },
      m: [['x', 'y'], ['w']],
      t: ['x', 'y', 'w'],
    },
    validationMode: ValidationMode.None,
  });
  const item = root.find(target)!;
  const received: unknown[] = [];
  const calls = () => {
    root.find(host)!.setValue(hostValue);
    if (input === 'value') item.setValue('z');
    else
      item.setValue((previous: unknown) => {
        received.push(previous);
        return 'z';
      });
  };
  if (batched) root.batch(calls);
  else calls();
  return {
    stored: {
      value: root.value,
      output: root.outputValue,
      host: root.find(host)?.value,
      misfits: root.misfits,
    },
    received,
  };
};

it.each([
  { host: '/list', hostValue: null, target: '/list/1' },
  { host: '/list', hostValue: 'str', target: '/list/1' },
  { host: '/list', hostValue: [], target: '/list/1' },
  { host: '/list', hostValue: ['a'], target: '/list/1' },
  { host: '/o/list', hostValue: ['a'], target: '/o/list/1' },
  { host: '/o', hostValue: null, target: '/o/list/1' },
  { host: '/o', hostValue: { a: 'B' }, target: '/o/list/1' },
  { host: '/m', hostValue: [['a']], target: '/m/0/1' },
  { host: '/m', hostValue: [['a']], target: '/m/1/0' },
  { host: '/t', hostValue: ['a'], target: '/t/1' },
] satisfies Scenario[])(
  'drops a batched $target write after $host is written as $hostValue, as separate calls do',
  (scenario) => {
    expect(observe(scenario, true).stored).toStrictEqual(
      observe(scenario, false).stored,
    );
  },
);

it('runs a removed item updater on an absent value and drops its result', () => {
  const scenario = { host: '/list', hostValue: null, target: '/list/1' };
  const batched = observe(scenario, true, 'updater');
  const sequential = observe(scenario, false, 'updater');
  expect(batched.stored).toStrictEqual(sequential.stored);
  expect(sequential.received).toStrictEqual([]);
  expect(batched.received).toStrictEqual([undefined]);
});

it('counts a dropped item write when a refused reset replays its later marks', () => {
  const run = (batched: boolean) => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          open: { type: 'boolean' },
          box: {
            type: 'object',
            controls: { active: '../open === true' },
            properties: { a: { type: 'string' } },
          },
          list: strings,
        },
      } as const satisfies AuthoredSchema,
      defaultValue: { open: true, box: { a: 'x' }, list: ['x', 'y'] },
      validationMode: ValidationMode.None,
    });
    const [list, item, field, box] = ['/list', '/list/1', '/box/a', '/box'].map(
      (path) => root.find(path),
    );
    if (!list || !item || !field || !box) throw new Error('Missing test node');
    const calls = () => {
      list.setValue(['n']);
      item.setValue('z');
      field.setValue('c');
      // Closing the scope refuses the reset, which keeps the in-scope mark minus what later
      // marks cover, so the dropped item write must still count as a mark.
      root.setValue({ open: false, box: { a: 'r' }, list: ['n'] });
      box.resetSubtree();
    };
    if (batched) root.batch(calls);
    else calls();
    return { value: root.value, inactive: root.inactiveValues };
  };
  expect(run(true)).toStrictEqual(run(false));
});

it.each([
  { host: '/list', hostValue: ['a', 'b'], target: '/list/1' },
  { host: '/m', hostValue: [['a'], ['b']], target: '/m/1/0' },
  { host: '/t', hostValue: ['a', 'b'], target: '/t/1' },
] satisfies Scenario[])(
  'applies a batched $target write whose position $hostValue keeps, as separate calls do',
  (scenario) => {
    expect(observe(scenario, true).stored).toStrictEqual(
      observe(scenario, false).stored,
    );
  },
);
