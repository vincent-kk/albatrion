import { describe, expect, it } from 'vitest';

import { SetValueOption } from '@/schema-form';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['A', 'B'], default: 'A' },
    s: { type: 'string' },
    host: {
      type: 'object',
      properties: { mode: { type: 'string', enum: ['x', 'y'], default: 'x' } },
      controls: { discriminator: 'mode' },
      oneOf: [
        {
          properties: {
            mode: { const: 'x' },
            cx: { type: 'object', properties: { p: { type: 'number' }, q: { type: 'number' } } },
          },
        },
        {
          properties: {
            mode: { const: 'y' },
            cy: { type: 'object', properties: { r: { type: 'number' }, t: { type: 'number' } } },
          },
        },
      ],
    },
    gated: {
      type: 'object',
      properties: {
        on: { type: 'boolean', default: true },
        inner: {
          type: 'object',
          properties: { u: { type: 'number' }, v: { type: 'number' } },
          controls: { active: '../on === true' },
        },
      },
    },
  },
  controls: { discriminator: 'kind' },
  oneOf: [
    { properties: { kind: { const: 'A' }, fa: { type: 'object', properties: { m: { type: 'string' }, n: { type: 'string' } } } } },
    { properties: { kind: { const: 'B' }, fb: { type: 'object', properties: { m: { type: 'string' }, n: { type: 'string' } } } } },
  ],
} as const;

const load = () => ({
  kind: 'A',
  s: 's',
  fa: { m: 'm0', n: 'n0' },
  host: { mode: 'x', cx: { p: 1, q: 2 } },
  gated: { on: true, inner: { u: 1, v: 2 } },
});

type Step = (root: any) => void;

const compare = (label: string, prepare: Step, steps: Step[]) => {
  const run = (mode: 'sequential' | 'batch') => {
    const { root } = build(schema, load());
    prepare(root);
    if (mode === 'batch') root.batch(() => steps.forEach((step) => step(root)));
    else steps.forEach((step) => step(root));
    return { value: root.value, inactive: root.inactiveValues };
  };
  const sequential = run('sequential');
  const batched = run('batch');
  diag(label, { sequential, batched });
  return { sequential, batched };
};

const unrelated: Step = (root) => root.find('/s').setValue('t');

describe('EQ10 nested Merge across branch and gate boundaries: batch against sequential', () => {
  it('B1 Merge that switches the root branch and supplies a partial nested object for the reentering branch', () => {
    const r = compare(
      'B1',
      (root) => {
        root.find('/kind').setValue('B');
        root.find('/kind').setValue('A');
        root.find('/kind').setValue('B');
      },
      [(root) => root.setValue({ kind: 'A', fa: { m: 'M' } }, SetValueOption.Merge), unrelated],
    );
    expect(r.batched).toEqual(r.sequential);
  });

  it('B2 Merge into a nested branch host switching mode with a partial object', () => {
    const r = compare(
      'B2',
      (root) => {
        root.find('/host/mode').setValue('y');
        root.find('/host/cy/r')?.setValue(5);
        root.find('/host/cy/t')?.setValue(6);
        root.find('/host/mode').setValue('x');
      },
      [(root) => root.find('/host').setValue({ mode: 'y', cy: { r: 9 } }, SetValueOption.Merge), unrelated],
    );
    expect(r.batched).toEqual(r.sequential);
  });

  it('B3 Merge that turns a gate back on with a partial object for the gated node', () => {
    const r = compare(
      'B3',
      (root) => root.find('/gated/on').setValue(false),
      [(root) => root.find('/gated').setValue({ on: true, inner: { u: 9 } }, SetValueOption.Merge), unrelated],
    );
    expect(r.batched).toEqual(r.sequential);
  });

  it('B4 two Merge writes on the same object with nested partials in a batch', () => {
    const r = compare('B4', () => {}, [
      (root) => root.find('/gated').setValue({ inner: { u: 7 } }, SetValueOption.Merge),
      (root) => root.find('/gated').setValue({ inner: { v: 8 } }, SetValueOption.Merge),
    ]);
    expect(r.batched).toEqual(r.sequential);
  });

  it('B5 Merge that turns the gate off and supplies the gated node in the same write', () => {
    const r = compare('B5', () => {}, [
      (root) => root.find('/gated').setValue({ on: false, inner: { u: 9 } }, SetValueOption.Merge),
      unrelated,
    ]);
    expect(r.batched).toEqual(r.sequential);
  });

  it('B6 Merge with an updater after a nested Merge on the same object', () => {
    const r = compare('B6', () => {}, [
      (root) => root.find('/gated').setValue({ inner: { u: 7 } }, SetValueOption.Merge),
      (root) =>
        root.find('/gated').setValue((prev: any) => ({ inner: { v: (prev?.inner?.u ?? 0) + 1 } }), SetValueOption.Merge),
    ]);
    expect(r.batched).toEqual(r.sequential);
  });
});
