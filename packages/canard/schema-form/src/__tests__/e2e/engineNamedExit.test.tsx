import { describe, expect, it } from 'vitest';

import {
  type JSONSchema as AuthoredSchema,
  ValidationMode,
  SetValueOption as WriteOption,
} from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

/*
 * Settle DETAIL WRITE-079: a declarative write applies to a node leaving in the same settlement as
 * the same write made after its exit, so a named value wins over every exit policy. Each shape
 * addresses the leaving occurrence by its own path instead of through a live parent object: the
 * leaving leaf, a leaving leaf under a live parent, a leaf under a leaving parent, and a virtual
 * group under a leaving parent. The gate closes and the rule fires in one batch, and in one Merge
 * write; both must leave the retained sources the two calls leave in sequence.
 */

type Shape =
  | 'leaf'
  | 'leafUnderLiveParent'
  | 'leafUnderLeavingParent'
  | 'groupUnderLeavingParent';
type Policy = 'default' | 'unsetOnInactive' | 'inactiveValue';

const GATE = '/on === true';

const policyFor = (policy: Policy, resolved: string | object) =>
  policy === 'default'
    ? {}
    : policy === 'unsetOnInactive'
      ? { unsetOnInactive: true }
      : { inactiveValue: resolved };

const inject = (target: string) => ({
  type: 'string' as const,
  controls: { injectTo: (value: unknown) => ({ [target]: value }) },
});

const createSchema = (shape: Shape, policy: Policy): AuthoredSchema => {
  if (shape === 'leaf')
    return {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        y: {
          type: 'string',
          controls: { active: GATE, ...policyFor(policy, 'resolved') },
        },
        src: inject('../y'),
      },
    };
  if (shape === 'leafUnderLiveParent')
    return {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        o: {
          type: 'object',
          properties: {
            y: {
              type: 'string',
              controls: { active: GATE, ...policyFor(policy, 'resolved') },
            },
          },
        },
        src: inject('../o/y'),
      },
    };
  if (shape === 'leafUnderLeavingParent')
    return {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        o: {
          type: 'object',
          controls: { active: GATE, ...policyFor(policy, { y: 'resolved' }) },
          properties: { y: { type: 'string' } },
        },
        src: inject('../o/y'),
      },
    };
  return {
    type: 'object',
    properties: {
      on: { type: 'boolean' },
      o: {
        type: 'object',
        controls: {
          active: GATE,
          ...policyFor(policy, { a: 'resolved', b: 'resolved' }),
        },
        properties: { a: { type: 'string' }, b: { type: 'string' } },
        options: { virtual: { g: { fields: ['a', 'b'] } } },
      },
      src: {
        type: 'string',
        controls: {
          injectTo: (value: unknown) =>
            typeof value === 'string' ? { '../o/g': [value, `${value}b`] } : {},
        },
      },
    },
  };
};

const DEFAULT_VALUES: Record<Shape, Record<string, unknown>> = {
  leaf: { on: true, y: 'old' },
  leafUnderLiveParent: { on: true, o: { y: 'old' } },
  leafUnderLeavingParent: { on: true, o: { y: 'old' } },
  groupUnderLeavingParent: { on: true, o: { a: 'old', b: 'old' } },
};

/** Retained values the named write leaves at its own addresses, whatever the exit policy left. */
const NAMED: Record<Shape, Record<string, unknown>> = {
  leaf: { '/y': 'new' },
  leafUnderLiveParent: { '/o/y': 'new' },
  leafUnderLeavingParent: { '/o/y': 'new' },
  groupUnderLeavingParent: { '/o/a': 'new', '/o/b': 'newb' },
};

const run = (
  shape: Shape,
  policy: Policy,
  mode: 'sequence' | 'batch' | 'merge',
) => {
  const root = mountEngineForm({
    jsonSchema: createSchema(shape, policy),
    defaultValue: DEFAULT_VALUES[shape],
    validationMode: ValidationMode.None,
  });
  if (mode === 'merge')
    root.setValue({ on: false, src: 'new' }, WriteOption.Merge);
  else {
    const calls = () => {
      root.find('/on')!.setValue(false);
      root.find('/src')!.setValue('new');
    };
    if (mode === 'batch') root.batch(calls);
    else calls();
  }
  return Object.fromEntries(
    root.inactiveValues.map(({ path, value }) => [path, value]),
  );
};

const ROWS = (
  [
    'leaf',
    'leafUnderLiveParent',
    'leafUnderLeavingParent',
    'groupUnderLeavingParent',
  ] as const
).flatMap((shape) =>
  (['default', 'unsetOnInactive', 'inactiveValue'] as const).map((policy) => ({
    shape,
    policy,
  })),
);

describe('a declarative write that addresses a leaving node keeps its value over the exit policy (WRITE-079)', () => {
  it.each(ROWS)('$shape with the $policy policy', ({ shape, policy }) => {
    const sequence = run(shape, policy, 'sequence');
    expect(sequence).toMatchObject(NAMED[shape]);
    expect(run(shape, policy, 'batch')).toEqual(sequence);
    expect(run(shape, policy, 'merge')).toEqual(sequence);
  });
});

it.each(['batch', 'merge'] as const)(
  'the direct named value wins over onInactive (WRITE-079, %s)',
  (mode) => {
    const root = mountEngineForm({
      jsonSchema: createSchema('leaf', 'default'),
      defaultValue: DEFAULT_VALUES.leaf,
      validationMode: ValidationMode.None,
    });
    root.find('/y')!.onInactive(() => 'listener');
    if (mode === 'merge')
      root.setValue({ on: false, src: 'new' }, WriteOption.Merge);
    else
      root.batch(() => {
        root.find('/on')!.setValue(false);
        root.find('/src')!.setValue('new');
      });
    expect(root.inactiveValues).toEqual([{ path: '/y', value: 'new' }]);
  },
);
