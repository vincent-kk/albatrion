import { describe, expect, it } from 'vitest';

import {
  type JSONSchema as AuthoredSchema,
  ValidationMode,
  SetValueOption as WriteOption,
} from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

/*
 * Settle DETAIL WRITE-079: where a declarative value lands is decided by the state of its address
 * when the write is applied. A live node is written, a node leaving in the settlement (or below one)
 * keeps the value after its exit policy, a node whose exit the settlement cancels is written live,
 * and any other inactive address keeps the value in its slot after every caller value and lower
 * winner of the settlement. Each case states its expected value and also compares one batch and one
 * Merge write with the same calls in sequence, where no rule observes an intermediate state.
 */

type Root = ReturnType<typeof mountEngineForm>;

const create = (jsonSchema: AuthoredSchema, defaultValue: object) =>
  mountEngineForm({
    jsonSchema,
    defaultValue,
    validationMode: ValidationMode.None,
  });

const observe = (root: Root) => ({
  value: root.value,
  retained: Object.fromEntries(
    root.inactiveValues.map(({ path, value }) => [path, value]),
  ),
});

const inject = (target: string, value: (source: string) => unknown) => ({
  type: 'string' as const,
  controls: {
    injectTo: (source: unknown) =>
      typeof source === 'string' && source ? { [target]: value(source) } : {},
  },
});

/** Runs the calls in sequence, in one batch, and as one root Merge write when `merge` is given. */
const runModes = (
  schema: AuthoredSchema,
  defaultValue: object,
  calls: readonly ((root: Root) => void)[],
  merge?: Record<string, unknown>,
  prepare: (root: Root) => void = () => {},
) => {
  const sequence = create(schema, defaultValue);
  prepare(sequence);
  for (const call of calls) call(sequence);
  const batched = create(schema, defaultValue);
  prepare(batched);
  batched.batch(() => {
    for (const call of calls) call(batched);
  });
  const merged = merge && create(schema, defaultValue);
  if (merged) {
    prepare(merged);
    merged.setValue(merge, WriteOption.Merge);
  }
  return {
    sequence: observe(sequence),
    batch: observe(batched),
    merge: merged && observe(merged),
  };
};

const set =
  (path: string, value: unknown) =>
  (root: Root): void =>
    root.find(path)!.setValue(value);

describe('a named value wins over an onInactive listener of the leaving node (WRITE-079)', () => {
  const listen = (path: string, result: unknown) => (root: Root) => {
    root.find(path)!.onInactive(() => result);
  };
  it.each([
    {
      name: 'the leaving leaf',
      schema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          y: { type: 'string', controls: { active: '/on === true' } },
          src: inject('../y', (source) => source),
        },
      } satisfies AuthoredSchema,
      defaultValue: { on: true, y: 'old' },
      listener: ['/y', 'listener'] as const,
      named: { '/y': 'new' },
    },
    {
      name: 'a leaving leaf under a live parent',
      schema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          o: {
            type: 'object',
            properties: {
              y: { type: 'string', controls: { active: '/on === true' } },
            },
          },
          src: inject('../o/y', (source) => source),
        },
      } satisfies AuthoredSchema,
      defaultValue: { on: true, o: { y: 'old' } },
      listener: ['/o/y', 'listener'] as const,
      named: { '/o/y': 'new' },
    },
    {
      name: 'a leaf under a leaving parent',
      schema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          o: {
            type: 'object',
            controls: { active: '/on === true' },
            properties: { y: { type: 'string' } },
          },
          src: inject('../o/y', (source) => source),
        },
      } satisfies AuthoredSchema,
      defaultValue: { on: true, o: { y: 'old' } },
      listener: ['/o', { y: 'listener' }] as const,
      named: { '/o/y': 'new' },
    },
    {
      name: 'a virtual group under a leaving parent',
      schema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          o: {
            type: 'object',
            controls: { active: '/on === true' },
            properties: { a: { type: 'string' }, b: { type: 'string' } },
            options: { virtual: { g: { fields: ['a', 'b'] } } },
          },
          src: inject('../o/g', (source) => [source, `${source}b`]),
        },
      } satisfies AuthoredSchema,
      defaultValue: { on: true, o: { a: 'old', b: 'old' } },
      listener: ['/o', { a: 'listener', b: 'listener' }] as const,
      named: { '/o/a': 'new', '/o/b': 'newb' },
    },
  ])('$name', ({ schema, defaultValue, listener, named }) => {
    const result = runModes(
      schema,
      defaultValue,
      [set('/on', false), set('/src', 'new')],
      { on: false, src: 'new' },
      listen(listener[0], listener[1]),
    );
    expect(result.sequence.retained).toMatchObject(named);
    expect(result.batch).toEqual(result.sequence);
    expect(result.merge).toEqual(result.sequence);
  });
});

describe('a higher winner whose live target leaves after the lower winner keeps its value (WRITE-079)', () => {
  const layered = (policy: Record<string, unknown>): AuthoredSchema => ({
    type: 'object',
    properties: {
      low: inject('../object', () => ({ on: false, x: 'x1' })),
      object: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          x: { type: 'string' },
          p: {
            type: 'string',
            controls: { active: '/object/on === true', ...policy },
          },
        },
      },
      high: inject('../object/p', () => 'high'),
    },
  });
  it.each([
    { policy: 'default', controls: {} },
    { policy: 'unsetOnInactive', controls: { unsetOnInactive: true } },
    { policy: 'inactiveValue', controls: { inactiveValue: 'resolved' } },
    { policy: 'onInactive', controls: {}, listener: 'listener' },
  ])('$policy', ({ controls, listener }) => {
    const result = runModes(
      layered(controls),
      { object: { on: true, x: 'x0', p: 'p0' } },
      [set('/low', 'l'), set('/high', 'h')],
      { low: 'l', high: 'h' },
      (root) => {
        if (listener) root.find('/object/p')!.onInactive(() => listener);
      },
    );
    expect(result.sequence.retained).toEqual({ '/object/p': 'high' });
    expect(result.batch).toEqual(result.sequence);
    expect(result.merge).toEqual(result.sequence);
  });
});

describe('a declarative value for an inactive address follows the caller value of the settlement (WRITE-079)', () => {
  const schema = (target: '../group' | '../b'): AuthoredSchema => ({
    type: 'object',
    properties: {
      bOn: { type: 'boolean' },
      a: { type: 'string' },
      b: { type: 'string', controls: { active: '/bOn === true' } },
      src: inject(target, (source) =>
        target === '../group' ? [`${source}_a`, `${source}_b`] : `${source}_b`,
      ),
    },
    options: { virtual: { group: { fields: ['a', 'b'] } } },
  });
  const DEFAULT = { bOn: false, a: 'a0', b: 'b0' };
  it.each([
    {
      name: 'a group write, then a rule writing the group',
      target: '../group' as const,
      caller: set('/group', ['x', 'b_up']),
    },
    {
      name: 'a group updater, then a rule writing the group',
      target: '../group' as const,
      caller: (root: Root) =>
        root.find('/group')!.setValue(() => ['x', 'b_up']),
    },
    {
      name: 'a root Merge, then a rule writing the constituent',
      target: '../b' as const,
      caller: (root: Root) => root.setValue({ b: 'b_up' }, WriteOption.Merge),
    },
  ])('$name', ({ target, caller }) => {
    const result = runModes(schema(target), DEFAULT, [
      caller,
      set('/src', 's1'),
    ]);
    expect(result.sequence.retained).toEqual({ '/b': 's1_b' });
    expect(result.batch).toEqual(result.sequence);
  });
  it.each([
    { name: 'one Merge naming the group rule', target: '../group' as const },
    { name: 'one Merge naming the direct rule', target: '../b' as const },
  ])('$name', ({ target }) => {
    const root = create(schema(target), DEFAULT);
    root.setValue({ b: 'b_up', src: 's1' }, WriteOption.Merge);
    expect(observe(root).retained).toEqual({ '/b': 's1_b' });
  });
});

describe('a declarative value for an inactive object replaces it whole, as the same caller write does (WRITE-079)', () => {
  it('a group rule naming an inactive object constituent', () => {
    const schema: AuthoredSchema = {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        a: {
          type: 'object',
          controls: { active: '/on === true' },
          properties: { p: { type: 'string' }, q: { type: 'string' } },
        },
        b: { type: 'string' },
        src: inject('../group', () => [{ p: 'new' }, 'b1']),
      },
      options: { virtual: { group: { fields: ['a', 'b'] } } },
    };
    const DEFAULT = { on: false, a: { p: 'p0', q: 'q0' }, b: 'b0' };
    const rule = create(schema, DEFAULT);
    rule.find('/src')!.setValue('s');
    const caller = create(schema, DEFAULT);
    caller.find('/group')!.setValue([{ p: 'new' }, 'b1']);
    expect(observe(rule).retained).toEqual({ '/a/p': 'new' });
    expect(observe(rule).retained).toEqual(observe(caller).retained);
  });
});

describe('a value named for a node whose exit the settlement cancels is written to the live node (WRITE-079)', () => {
  const schema: AuthoredSchema = {
    type: 'object',
    properties: {
      on: { type: 'boolean' },
      object: {
        type: 'object',
        properties: {
          x: { type: 'string' },
          nested: {
            type: 'object',
            controls: { active: '/on === true', unsetOnInactive: true },
            properties: { p: { type: 'string' }, q: { type: 'string' } },
          },
        },
      },
      src: inject('../object', (source) => ({
        x: 'x1',
        nested: { p: source },
      })),
      reopen: inject('../on', () => true),
    },
  };
  it('in one batch and in one Merge write', () => {
    const result = runModes(
      schema,
      { on: true, object: { x: 'x0', nested: { p: 'p0', q: 'q0' } } },
      [set('/on', false), set('/src', 'v'), set('/reopen', 'r')],
      { on: false, src: 'v', reopen: 'r' },
    );
    const expected = {
      on: true,
      object: { x: 'x1', nested: { p: 'v' } },
      src: 'v',
      reopen: 'r',
    };
    expect(result.batch).toEqual({ value: expected, retained: {} });
    expect(result.merge).toEqual({ value: expected, retained: {} });
  });
});
