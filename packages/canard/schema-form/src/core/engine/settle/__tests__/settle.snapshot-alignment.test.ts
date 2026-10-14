import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '../../../__tests__/makeFieldNodeTree';
import { FieldNode } from '../../../surface/FieldNode';
import { WriteOption } from '../../types/value';
import { loadFieldNodeAtMount } from '../index';

describe('49C-01 snapshot alignment matches sequential writes', () => {
  it('fills sparse default slots when a later child alignment reuses the array', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        a: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              x: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    });
    if (!(root instanceof FieldNode))
      throw new Error('Expected a runtime FieldNode');
    const sparse: { x: string[] }[] = [];
    sparse[1] = { x: ['1'] };
    sparse[2] = { x: [] };
    loadFieldNodeAtMount<FieldNode>(root, { a: sparse }, WriteOption.Overwrite);
    root.setValue({ a: [{ x: [] }, { x: ['1', '2'] }] });
    expect(Object.keys(root.find('/a')!.defaultValue as unknown[])).toEqual([
      '0',
      '1',
    ]);
  });

  it('keeps resized child arrays in settlement registration order', () => {
    const { root } = makeFieldNodeTree({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tags: { type: 'array', items: { type: 'string' } },
          sub: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    if (!(root instanceof FieldNode))
      throw new Error('Expected a runtime FieldNode');
    loadFieldNodeAtMount<FieldNode>(root, [], WriteOption.Overwrite);
    root.setValue([{ tags: ['x'], sub: ['y', 'z'] }]);
    expect(
      Object.keys((root.defaultValue as Record<string, unknown>[])[0]),
    ).toEqual(['tags', 'sub']);
  });

  it('retains an array default under a named path in an array snapshot', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              list: { type: 'array', items: { type: 'string' } },
              h: { type: 'string' },
            },
          },
        },
      },
    });
    if (!(root instanceof FieldNode))
      throw new Error('Expected a runtime FieldNode');
    loadFieldNodeAtMount<FieldNode>(root, [], WriteOption.Overwrite);
    root.setValue({ rows: [{ list: ['a'] }, { list: [] }] });
    root.setValue({ rows: [{ list: ['a', 'b'] }, { list: ['c'] }] });
    expect(Array.isArray(root.find('/rows')!.defaultValue)).toBe(true);
  });

  it('drops a previous named array property when the next sibling is aligned', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        rows: { type: 'array', items: { type: 'string' } },
        xa: { type: 'array', items: { type: 'string' } },
      },
    });
    if (!(root instanceof FieldNode))
      throw new Error('Expected a runtime FieldNode');
    loadFieldNodeAtMount<FieldNode>(root, [], WriteOption.Overwrite);
    root.setValue({ rows: ['x'], xa: ['y', 'z'] });
    expect(root.find('/rows')!.defaultValue).toBeUndefined();
  });
});
