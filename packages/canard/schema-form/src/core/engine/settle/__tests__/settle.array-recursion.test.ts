import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { arrangeFieldNodeItems } from '../arrangeFieldNodeItems';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';

/** Recursive items terminate at their empty children array (BLUEPRINT-030). */
const recursiveArraySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    children: { type: 'array', items: { $ref: '#' } },
  },
};

// filid:contract settle-array-recursion
describe('BLUEPRINT-030 recursive array item expansion', () => {
  it('expands an empty item with referenced fields and an empty array base case', () => {
    const { root } = createTestTree(recursiveArraySchema);
    loadFieldNodeAtMount(root, { children: [{}] }, WriteOption.Overwrite);

    const item = root.childrenByName!.children.children![0];
    expect(item.childrenByName!.id.path).toBe('/children/0/id');
    expect(item.childrenByName!.children.path).toBe('/children/0/children');
    expect(item.childrenByName!.children.children).toEqual([]);
    expect(item.childrenByName!.children.storedValue).toEqual([]);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('pushes one referenced level per item without expanding empty child arrays', () => {
    const { root } = createTestTree(recursiveArraySchema);
    loadFieldNodeAtMount(root, { children: [] }, WriteOption.Overwrite);
    const children = root.childrenByName!.children;
    expect(children.children).toEqual([]);

    expect(arrangeFieldNodeItems(children, { kind: 'push', value: {} })).toBe(
      1,
    );
    const item = children.children![0];
    expect(item.childrenByName!.id.path).toBe('/children/0/id');
    const nestedChildren = item.childrenByName!.children;
    expect(nestedChildren.children).toEqual([]);
    expect(
      arrangeFieldNodeItems(nestedChildren, { kind: 'push', value: {} }),
    ).toBe(1);
    const nestedItem = nestedChildren.children![0];
    expect(nestedItem.childrenByName!.id.path).toBe(
      '/children/0/children/0/id',
    );
    expect(nestedItem.childrenByName!.children.children).toEqual([]);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('keeps the blueprint guard for object-property-only self recursion', () => {
    expect(() =>
      createTestTree({
        type: 'object',
        properties: { next: { $ref: '#' } },
      }),
    ).toThrow(
      expect.objectContaining({ specific: 'RECURSIVE_SHAPE_UNBOUNDED' }),
    );
  });

  it('keeps the settlement guard for a source-free gated object cycle inside an item', () => {
    const { root } = createTestTree({
      type: 'array',
      items: { $ref: '#/$defs/Node' },
      $defs: {
        Node: {
          type: 'object',
          if: { not: { required: ['stop'] } },
          then: { properties: { next: { $ref: '#/$defs/Node' } } },
        },
      },
    });
    expect(() =>
      loadFieldNodeAtMount(root, [{}], WriteOption.Overwrite),
    ).toThrow(
      expect.objectContaining({
        code: 'SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED',
      }),
    );
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'budget',
      exceededBudget: 'recursion',
    });
  });
});
