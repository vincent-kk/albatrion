import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';
import { WriteOption } from '../../types/value';

const schema = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          kind: { type: 'string' },
          a: { type: 'string' },
          b: { type: 'string', controls: { active: '../on === true' } },
        },
        allOf: [
          {
            if: { properties: { kind: { const: 'c' } }, required: ['kind'] },
            then: { properties: { c: { type: 'string' } } },
          },
        ],
        options: {
          virtual: {
            live: { fields: ['a', 'kind'] },
            inactive: { fields: ['a', 'b'] },
            absent: { fields: ['a', 'c'] },
          },
        },
      },
    },
  },
} as const satisfies AuthoredSchema;

type Scenario = {
  /** Value the first call writes at `/list` */
  list: unknown;
  /** Virtual group of `/list/1` the second call writes */
  group: 'live' | 'inactive' | 'absent';
  /** Second call's Merge option; omitted for Overwrite */
  option?: WriteOption.Merge;
};

/**
 * Write the whole array, then write a group of item 1 through a reference taken before it,
 * in one batch or as separate calls. Item 1's `b` is inactive and its `c` is absent.
 * @param scenario - The first call's array and the second call's group and option
 * @param batched - Whether both calls run inside one `root.batch`
 * @param input - Second call's input; an updater records what it receives
 * @returns The stored observations that must not depend on batching, and the updater inputs
 */
const observe = (
  { list, group, option }: Scenario,
  batched: boolean,
  input: 'value' | 'updater' = 'value',
) => {
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: {
      list: [
        { on: true, a: 'a0', b: 'b0' },
        { on: false, a: 'a1', b: 'b1' },
      ],
    },
    validationMode: ValidationMode.None,
  });
  const host = root.find('/list');
  const pair = root.find(`/list/1/${group}`);
  if (!host || !pair) throw new Error('Missing test node');
  const received: unknown[] = [];
  const calls = () => {
    host.setValue(list);
    if (input === 'value') pair.setValue(['p', 'q'], option);
    else
      pair.setValue((previous: unknown) => {
        received.push(previous);
        return ['p', 'q'];
      }, option);
  };
  if (batched) root.batch(calls);
  else calls();
  return {
    stored: {
      value: root.value,
      output: root.outputValue,
      inactive: root.inactiveValues,
      misfits: root.misfits,
    },
    received,
  };
};

it.each([
  { list: [{ a: 'n' }], group: 'inactive' },
  { list: [{ a: 'n' }], group: 'absent' },
  { list: [{ a: 'n' }], group: 'live' },
  { list: null, group: 'inactive' },
  { list: [], group: 'absent' },
  { list: [{ a: 'n' }], group: 'inactive', option: WriteOption.Merge },
  { list: [{ a: 'n' }], group: 'absent', option: WriteOption.Merge },
] satisfies Scenario[])(
  'drops a batched $group group write in item 1 after the array is written as $list, as separate calls do',
  (scenario) => {
    expect(observe(scenario, true).stored).toStrictEqual(
      observe(scenario, false).stored,
    );
  },
);

it('runs a removed item group updater on absent slots and drops its result', () => {
  const scenario: Scenario = { list: [{ a: 'n' }], group: 'inactive' };
  const batched = observe(scenario, true, 'updater');
  const sequential = observe(scenario, false, 'updater');
  expect(batched.stored).toStrictEqual(sequential.stored);
  expect(sequential.received).toStrictEqual([]);
  expect(batched.received).toStrictEqual([[undefined, undefined]]);
});

it.each([
  { list: [{ a: 'n' }, { a: 'm', on: false }], group: 'inactive' },
  { list: [{ a: 'n' }, { a: 'm', on: false }], group: 'absent' },
  {
    list: [{ a: 'n' }, { a: 'm', on: false }],
    group: 'inactive',
    option: WriteOption.Merge,
  },
] satisfies Scenario[])(
  'applies a batched $group group write in item 1 that $list keeps, as separate calls do',
  (scenario) => {
    expect(observe(scenario, true).stored).toStrictEqual(
      observe(scenario, false).stored,
    );
  },
);
