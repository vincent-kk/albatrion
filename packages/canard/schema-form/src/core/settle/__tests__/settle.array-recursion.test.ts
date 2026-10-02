import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { arrangeSchemaNodeItems, loadSchemaNodeAtMount } from '../index';
import { createTestTree } from './fixtures/createTestTree';

/** Recursive items terminate at their empty children array (BLUEPRINT-030). */
const recursiveArraySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    children: { type: 'array', items: { $ref: '#' } },
  },
};

// filid:contract settle-array
describe('BLUEPRINT-030 recursive array item expansion', () => {
  it('expands an empty item with referenced fields and an empty array base case', () => {
    const { root } = createTestTree(recursiveArraySchema);
    loadSchemaNodeAtMount(root, { children: [{}] }, SetValueOption.Overwrite);

    const item = root.structure!.children.children![0];
    expect(item.structure!.id.path).toBe('/children/0/id');
    expect(item.structure!.children.path).toBe('/children/0/children');
    expect(item.structure!.children.children).toEqual([]);
    expect(item.structure!.children.local).toEqual([]);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('pushes one referenced level per item without expanding empty child arrays', () => {
    const { root } = createTestTree(recursiveArraySchema);
    loadSchemaNodeAtMount(root, { children: [] }, SetValueOption.Overwrite);
    const children = root.structure!.children;
    expect(children.children).toEqual([]);

    expect(arrangeSchemaNodeItems(children, { kind: 'push', value: {} })).toBe(1);
    const item = children.children![0];
    expect(item.structure!.id.path).toBe('/children/0/id');
    const nestedChildren = item.structure!.children;
    expect(nestedChildren.children).toEqual([]);
    expect(arrangeSchemaNodeItems(nestedChildren, { kind: 'push', value: {} }))
      .toBe(1);
    const nestedItem = nestedChildren.children![0];
    expect(nestedItem.structure!.id.path).toBe('/children/0/children/0/id');
    expect(nestedItem.structure!.children.children).toEqual([]);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('keeps the blueprint guard for object-property-only self recursion', () => {
    expect(() => createTestTree({
      type: 'object', properties: { next: { $ref: '#' } },
    })).toThrow(expect.objectContaining({ specific: 'RECURSIVE_SHAPE_UNBOUNDED' }));
  });

  it('keeps the settlement guard for a source-free gated object cycle inside an item', () => {
    const { root } = createTestTree({
      type: 'array', items: { $ref: '#/$defs/Node' },
      $defs: {
        Node: {
          type: 'object',
          if: { not: { required: ['stop'] } },
          then: { properties: { next: { $ref: '#/$defs/Node' } } },
        },
      },
    });
    expect(() => loadSchemaNodeAtMount(root, [{}], SetValueOption.Overwrite))
      .toThrow(expect.objectContaining({
        code: 'SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED',
      }));
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded', cause: 'budget', exceededBudget: 'recursion',
    });
  });
});
