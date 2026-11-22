import { describe, expect, it } from 'vitest';

import { SetValueOption } from '@/schema-form';

import { build, diag } from './probeHelpers';

/**
 * documents/docs/canard/schema-form/schema-reference.mdx:99 states:
 * "Multi-write batch merges are shallow." The probes run the documented case
 * (a nested Merge plus another write in one batch) and check both the value and
 * the explicit-coverage reading of that sentence against the code.
 */
const schema = {
  type: 'object',
  properties: {
    gate: { type: 'boolean', default: true },
    o: {
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: {
              type: 'number',
              controls: {
                active: '/gate === true',
                inactiveValue: () => 77,
              },
            },
          },
        },
      },
    },
    s: { type: 'string' },
  },
} as const;

const load = () => ({ gate: true, o: { a: { x: 1, y: 2 } }, s: 's' });

/**
 * documents/docs/canard/schema-form/api-reference.mdx:179 states for array verbs:
 * "In a batch they compute on prior marks at the call site; whole-array settlement
 * carries item identity by position."
 */
describe('CA2 api-reference "whole-array settlement carries item identity by position"', () => {
  it('M3 after batch(remove(0)) the node at position 0 is the node that held position 0', () => {
    const { root } = build(
      {
        type: 'object',
        properties: { list: { type: 'array', items: { type: 'string' } } },
      },
      { list: ['a', 'b'] },
    );
    const list = root.find('/list');
    const [first, second] = list.children;
    root.batch(() => list.remove(0));
    diag('M3', {
      zeroIsFirst: list.children[0] === first,
      zeroIsSecond: list.children[0] === second,
      firstDetached: first.isDetached,
    });
    expect({ zeroIsFirst: list.children[0] === first }).toEqual({ zeroIsFirst: true });
  });
});

describe('CA2 schema-reference "Multi-write batch merges are shallow"', () => {
  it('M1 value: a nested Merge in a multi-write batch keeps o.a.y, so the merge is not shallow', () => {
    const { root } = build(schema, load());
    root.batch(() => {
      root.setValue({ o: { a: { x: 9 } } }, SetValueOption.Merge);
      root.find('/s').setValue('t');
    });
    diag('M1', root.value);
    // A shallow merge of { o: { a: { x: 9 } } } replaces o.a whole and drops y.
    expect(root.value.o.a).toEqual({ x: 9 });
  });

  it('M2 coverage: the resolver of /o/a/y runs, so the batch Merge did not cover y', () => {
    const { root } = build(schema, load());
    root.batch(() => {
      root.setValue({ o: { a: { x: 9 } } }, SetValueOption.Merge);
      root.find('/gate').setValue(false);
    });
    const retained = root.inactiveValues;
    diag('M2', { value: root.value, retained });
    // Shallow coverage would make caller JSON win at /o/a/y and skip the resolver.
    expect(retained).not.toContainEqual({ path: '/o/a/y', value: 77 });
  });
});
