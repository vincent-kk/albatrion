import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { SchemaNode } from '../../SchemaNode/SchemaNode';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount } from '../index';

describe('49C-01 snapshot alignment matches sequential writes', () => {
  it('keeps resized child arrays in settlement registration order', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: {
        tags: { type: 'array', items: { type: 'string' } },
        sub: { type: 'array', items: { type: 'string' } },
      },
    } });
    if (!(root instanceof SchemaNode))
      throw new Error('Expected a runtime SchemaNode');
    loadSchemaNodeAtMount<SchemaNode>(root, [], SetValueOption.Overwrite);
    root.setValue([{ tags: ['x'], sub: ['y', 'z'] }]);
    expect(Object.keys((root.defaultValue as Record<string, unknown>[])[0]))
      .toEqual(['tags', 'sub']);
  });

  it('retains an array default under a named path in an array snapshot', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      rows: { type: 'array', items: { type: 'object', properties: {
        list: { type: 'array', items: { type: 'string' } },
        h: { type: 'string' },
      } } },
    } });
    if (!(root instanceof SchemaNode))
      throw new Error('Expected a runtime SchemaNode');
    loadSchemaNodeAtMount<SchemaNode>(root, [], SetValueOption.Overwrite);
    root.setValue({ rows: [{ list: ['a'] }, { list: [] }] });
    root.setValue({ rows: [{ list: ['a', 'b'] }, { list: ['c'] }] });
    expect(Array.isArray(root.find('/rows')!.defaultValue)).toBe(true);
  });

  it('drops a previous named array property when the next sibling is aligned', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      rows: { type: 'array', items: { type: 'string' } },
      xa: { type: 'array', items: { type: 'string' } },
    } });
    if (!(root instanceof SchemaNode))
      throw new Error('Expected a runtime SchemaNode');
    loadSchemaNodeAtMount<SchemaNode>(root, [], SetValueOption.Overwrite);
    root.setValue({ rows: ['x'], xa: ['y', 'z'] });
    expect(root.find('/rows')!.defaultValue).toBeUndefined();
  });
});
