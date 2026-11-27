import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { isArrayNode } from '../../surface';
import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';

type Root = ReturnType<typeof nodeFromJSONSchema>;
type Call = (root: Root) => void;

/**
 * Batch dimensions the differential generator in batchDeclarativeWrites.test.ts does not reach
 * (settle DETAIL WRITE-079, write DETAIL EVENT-013 and EVENT-019): structure verbs and resets as
 * segment barriers, rule chains, kind rank on one target, derive budget rollback, a latent group
 * and the delivery count.
 */
const schema: AuthoredSchema = {
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    other: { type: 'boolean' },
    list: { type: 'array', items: { type: 'string' } },
    listSource: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          typeof value === 'string' ? { '../list': JSON.parse(value) } : {},
      },
    },
    first: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          typeof value === 'string' ? { '../second': `${value}>` } : {},
      },
    },
    second: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          typeof value === 'string' ? { '../list': [value] } : {},
      },
    },
    a: { type: 'string' },
    target: { type: 'string', controls: { derived: '../a' } },
    targetSource: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          typeof value === 'string' ? { '../target': value } : {},
      },
    },
    ping: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          typeof value === 'string' ? { '../pong': `${value}1` } : {},
      },
    },
    pong: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          typeof value === 'string' ? { '../ping': `${value}2` } : {},
      },
    },
    box: {
      type: 'object',
      properties: { m: { type: 'string' }, n: { type: 'string' } },
      options: { virtual: { pair: { fields: ['m', 'n'] } } },
      controls: { active: '/on === true' },
    },
    pairSource: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          typeof value === 'string' ? { '../box/pair': JSON.parse(value) } : {},
      },
    },
  },
};

const DEFAULT = {
  on: false,
  other: false,
  list: ['l0'],
  a: 'a0',
  box: { m: 'm0', n: 'n0' },
};

const create = () =>
  nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: DEFAULT,
    validationMode: ValidationMode.None,
  });

const set =
  (path: string, value: unknown): Call =>
  (root) =>
    root.find(path)!.setValue(value);

const read = (root: Root, name: string) => {
  const value: unknown = root.value;
  return value !== null && typeof value === 'object' && name in value
    ? Reflect.get(value, name)
    : undefined;
};

const run = (calls: readonly Call[], batched: boolean) => {
  const root = create();
  let deliveries = 0;
  root.subscribe(() => {
    deliveries++;
  });
  const apply = () => {
    for (const call of calls) call(root);
  };
  let error: unknown;
  try {
    if (batched) root.batch(apply);
    else apply();
  } catch (thrown) {
    error = thrown;
  }
  return { root, deliveries, error };
};

const codeOf = (error: unknown) =>
  error !== null && typeof error === 'object' && 'code' in error
    ? error.code
    : undefined;

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : undefined;

type Case = {
  readonly name: string;
  readonly calls: readonly Call[];
  /** Root fields the case checks, with the value the batch must leave. */
  readonly expected: Readonly<Record<string, unknown>>;
  readonly isSequenceEqual: boolean;
};

const CASES: readonly Case[] = [
  {
    name: 'an array item update after a pending trigger settles the trigger first',
    calls: [
      set('/listSource', '["a","b"]'),
      (root) => {
        const list = root.find('/list');
        if (isArrayNode(list)) list.update(0, 'z');
      },
    ],
    expected: { list: ['z', 'b'] },
    isSequenceEqual: true,
  },
  {
    name: 'a root reset discards the marks inside its scope',
    calls: [set('/listSource', '["a"]'), (root) => root.resetSubtree()],
    expected: { list: ['l0'], listSource: undefined },
    isSequenceEqual: true,
  },
  {
    name: 'a rule chain runs its later rounds after the caller writes',
    calls: [set('/other', true), set('/first', 'x')],
    expected: { second: 'x>', list: ['x>'] },
    isSequenceEqual: true,
  },
  {
    name: 'derived outranks injectTo on one target whatever the call order: derived source first',
    calls: [set('/a', 'A'), set('/targetSource', 'S')],
    expected: { target: 'A' },
    isSequenceEqual: false,
  },
  {
    name: 'derived outranks injectTo on one target whatever the call order: injected source first',
    calls: [set('/targetSource', 'S'), set('/a', 'A')],
    expected: { target: 'A' },
    isSequenceEqual: true,
  },
  {
    name: 'a derive budget overrun rolls back the automatic writes and keeps the caller writes',
    calls: [set('/other', true), set('/ping', 'x')],
    expected: { other: true, ping: 'x', pong: undefined },
    isSequenceEqual: true,
  },
];

describe('batch reactions beyond the generator', () => {
  it.each(CASES)('$name', ({ calls, expected, isSequenceEqual }) => {
    const sequenceRun = run(calls, false);
    const batchRun = run(calls, true);
    // The error names the settlement target: the written field in sequence, the batch root in a batch.
    expect(codeOf(batchRun.error)).toBe(codeOf(sequenceRun.error));
    const sequence = sequenceRun.root;
    const batch = batchRun.root;
    for (const [name, value] of Object.entries(expected)) {
      expect(read(batch, name), name).toEqual(value);
      if (isSequenceEqual) expect(read(sequence, name), name).toEqual(value);
    }
    if (!isSequenceEqual)
      expect(
        Object.keys(expected).some(
          (name) => read(sequence, name) !== expected[name],
        ),
      ).toBe(true);
  });

  it('a derive budget error in a batch names the batch root, with the code and rollback of the sequence (SETTLE-011)', () => {
    const calls = [set('/other', true), set('/ping', 'x')];
    const sequence = run(calls, false);
    const batch = run(calls, true);
    expect(codeOf(batch.error)).toBe(codeOf(sequence.error));
    expect(messageOf(sequence.error)).toBe('Derive budget exceeded at /ping');
    expect(messageOf(batch.error)).toBe(
      `Derive budget exceeded at ${batch.root.path}`,
    );
    expect(batch.root.value).toEqual(sequence.root.value);
    expect(read(batch.root, 'pong')).toBeUndefined();
  });

  it('a reset barrier preserves the target of a single write budget error', () => {
    const batch = run(
      [
        set('/ping', 'x'),
        set('/other', true),
        (root) => root.find('/other')!.resetSubtree(),
      ],
      true,
    );
    expect(messageOf(batch.error)).toBe('Derive budget exceeded at /ping');
    expect(read(batch.root, 'ping')).toBe('x');
    expect(read(batch.root, 'pong')).toBeUndefined();
    expect(read(batch.root, 'other')).toBe(false);
  });

  it('a declarative write to a group inside an inactive owner keeps its tuple in the retained slots', () => {
    const calls = [set('/other', true), set('/pairSource', '["x","y"]')];
    for (const batched of [false, true]) {
      const { root } = run(calls, batched);
      expect(read(root, 'box')).toBeUndefined();
      expect(
        root.inactiveValues.map(({ path, value }) => ({ path, value })),
      ).toEqual([
        { path: '/box/m', value: 'x' },
        { path: '/box/n', value: 'y' },
      ]);
    }
  });

  it('a batch delivers once and leaves the same divergence as the calls in sequence', () => {
    const calls = [set('/other', true), set('/a', 'A'), set('/other', false)];
    const sequence = run(calls, false);
    const batch = run(calls, true);
    expect(batch.deliveries).toBe(1);
    expect(sequence.deliveries).toBe(3);
    expect(batch.root.isDivergent).toBe(sequence.root.isDivergent);
    expect(batch.root.find('/a')!.isDivergent).toBe(true);
    expect(batch.root.value).toEqual(sequence.root.value);
  });
});
