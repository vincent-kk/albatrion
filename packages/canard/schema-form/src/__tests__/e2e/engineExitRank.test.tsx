import { expect, it } from 'vitest';

import {
  type JSONSchema as AuthoredSchema,
  ValidationMode,
  SetValueOption as WriteOption,
} from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

/*
 * Settle DETAIL WRITE-079: overlapping declarative winners apply from the lowest rank up, so the
 * higher winner decides an address both name. Here a lower rule names the descendant /o/y and a
 * higher rule names the whole /o, in the settlement that makes /o leave; the leaving record and,
 * when a later rule reopens /o, the revived node both end with the higher winner's y, as the same
 * calls in sequence do.
 */

type Mode = 'merge' | 'batch' | 'nested';

const inject = (target: string, value: unknown) => ({
  type: 'string' as const,
  controls: {
    injectTo: (source: unknown) => (source ? { [target]: value } : {}),
  },
});

const createSchema = (isRevived: boolean): AuthoredSchema => ({
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    low: inject('../o/y', 'low'),
    o: {
      type: 'object',
      controls: { active: '/on === true' },
      properties: { x: { type: 'string' }, y: { type: 'string' } },
    },
    high: inject('../o', { x: 'highX', y: 'high' }),
    ...(isRevived ? { reopen: inject('../on', true) } : {}),
  },
});

const run = (isRevived: boolean, mode: Mode) => {
  const root = mountEngineForm({
    jsonSchema: createSchema(isRevived),
    defaultValue: { on: true, o: { x: 'x0', y: 'y0' } },
    validationMode: ValidationMode.None,
  });
  const values: Record<string, unknown> = {
    on: false,
    low: 'l',
    high: 'h',
    ...(isRevived ? { reopen: 'r' } : {}),
  };
  const apply = () => {
    for (const [name, value] of Object.entries(values))
      root.find(`/${name}`)!.setValue(value);
  };
  if (mode === 'merge') root.setValue(values, WriteOption.Merge);
  else if (mode === 'batch') root.batch(apply);
  else root.batch(() => root.batch(apply));
  return {
    o: root.find('/o')?.value,
    retained: Object.fromEntries(
      root.inactiveValues.map(({ path, value }) => [path, value]),
    ),
  };
};

it.each(['merge', 'batch', 'nested'] as const)(
  'a higher whole winner over a lower descendant winner decides the leaving record (%s)',
  (mode) => {
    expect(run(false, mode)).toEqual({
      o: undefined,
      retained: { '/o/x': 'highX', '/o/y': 'high' },
    });
  },
);

it.each(['merge', 'batch', 'nested'] as const)(
  'a higher whole winner over a lower descendant winner decides the revived node (%s)',
  (mode) => {
    expect(run(true, mode)).toEqual({
      o: { x: 'highX', y: 'high' },
      retained: {},
    });
  },
);

it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
] as const)(
  'applies overlapping addresses from one rule in return order (WRITE-079, reverse=%s, revived=%s)',
  (reverse, revived) => {
    const descendant = ['../o/n/y', 'low'] as const;
    const parent = ['../o', { n: { x: 'wholeX', y: 'wholeY' } }] as const;
    const entries = reverse ? [parent, descendant] : [descendant, parent];
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          src: {
            type: 'string',
            controls: {
              injectTo: (value) => (value ? Object.fromEntries(entries) : {}),
            },
          },
          o: {
            type: 'object',
            controls: { active: '/on === true' },
            properties: {
              n: {
                type: 'object',
                properties: { x: { type: 'string' }, y: { type: 'string' } },
              },
            },
          },
          ...(revived ? { reopen: inject('../on', true) } : {}),
        },
      },
      defaultValue: { on: true, o: { n: { x: 'x0', y: 'y0' } } },
      validationMode: ValidationMode.None,
    });
    root.setValue(
      { on: false, src: 's', ...(revived ? { reopen: 'r' } : {}) },
      WriteOption.Merge,
    );
    const expected = reverse ? 'low' : 'wholeY';
    if (revived) expect(root.find('/o/n/y')!.value).toBe(expected);
    else
      expect(root.inactiveValues).toContainEqual({
        path: '/o/n/y',
        value: expected,
      });
  },
);

it.each([false, true] as const)(
  'overlapping aliases keep their own addressed writes (WRITE-079, reverse caller order=%s)',
  (reverse) => {
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        options: {
          virtual: {
            g1: { fields: ['box', 'b'] },
            g2: { fields: ['box', 'c'] },
          },
        },
        properties: {
          on: { type: 'boolean' },
          box: {
            type: 'object',
            properties: {
              nested: {
                type: 'object',
                properties: {
                  p: { type: 'string' },
                  q: { type: 'string', controls: { active: '/on === true' } },
                },
              },
            },
          },
          b: { type: 'string' },
          c: { type: 'string' },
          s1: inject('../g1', [{ nested: { q: 'retq' } }, 'b1']),
          s2: inject('../g2', [{ nested: { p: 'newp' } }, 'c1']),
        },
      },
      defaultValue: { on: false, box: { nested: { p: 'p0', q: 'q0' } } },
      validationMode: ValidationMode.None,
    });
    const callers = [
      ['/s1', 'retq'],
      ['/s2', 'newp'],
    ] as const;
    root.batch(() => {
      for (const [path, value] of reverse ? [...callers].reverse() : callers)
        root.find(path)!.setValue(value);
    });
    expect(root.find('/box')!.value).toEqual({ nested: { p: 'newp' } });
    expect(root.inactiveValues).toEqual([
      { path: '/box/nested/q', value: 'retq' },
    ]);
  },
);

it.each([
  ['whole last', false],
  ['whole last', true],
  ['whole first', false],
  ['whole first', true],
] as const)(
  'three overlapping targets agree with sequential writes (WRITE-079, %s, revived=%s)',
  (order, revived) => {
    const low =
      order === 'whole last'
        ? inject('../o/n/y', 'low')
        : inject('../o', { x: 'lowX', n: { x: 'lowNX', y: 'lowNY' } });
    const high =
      order === 'whole last'
        ? inject('../o', { x: 'highX', n: { x: 'highNX', y: 'highNY' } })
        : inject('../o/n/y', 'high');
    const jsonSchema: AuthoredSchema = {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        low,
        mid: inject('../o/g', ['middleX', { x: 'middleNX', y: 'middleNY' }]),
        high,
        o: {
          type: 'object',
          controls: { active: '/on === true' },
          options: { virtual: { g: { fields: ['x', 'n'] } } },
          properties: {
            x: { type: 'string' },
            n: {
              type: 'object',
              properties: { x: { type: 'string' }, y: { type: 'string' } },
            },
          },
        },
        ...(revived ? { reopen: inject('../on', true) } : {}),
      },
    };
    const values = {
      on: false,
      low: 'l',
      mid: 'm',
      high: 'h',
      ...(revived ? { reopen: 'r' } : {}),
    };
    const observe = (mode: Mode | 'sequence') => {
      const root = mountEngineForm({
        jsonSchema,
        defaultValue: { on: true, o: { x: 'x0', n: { x: 'nx0', y: 'ny0' } } },
        validationMode: ValidationMode.None,
      });
      const write = () => {
        for (const [key, value] of Object.entries(values))
          root.find('/' + key)!.setValue(value);
      };
      if (mode === 'merge') root.setValue(values, WriteOption.Merge);
      else if (mode === 'batch') root.batch(write);
      else if (mode === 'nested') root.batch(() => root.batch(write));
      else write();
      return {
        value: root.value,
        retained: Object.fromEntries(
          root.inactiveValues.map(({ path, value }) => [path, value]),
        ),
      };
    };
    const expected = observe('sequence');
    for (const mode of ['merge', 'batch', 'nested'] as const)
      expect(observe(mode), mode).toEqual(expected);
  },
);
