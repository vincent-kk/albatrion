import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import type { SchemaNode as RuntimeSchemaNode } from '../../SchemaNode/SchemaNode';

const makeRecordTree = (...args: Parameters<typeof makeSchemaNodeTree>) => {
  const tree = makeSchemaNodeTree(...args);
  return { ...tree, root: tree.root as unknown as RuntimeSchemaNode };
};

// filid:contract settle-array
describe('array legacy contract ports', () => {
  it('VALUE-034 exposes an empty nested array on load before child writes', () => {
    const { root } = makeRecordTree({ type: 'object', properties: {
      list: { type: 'array', items: { type: 'string' } },
    } }, { snapshot: {} });
    root.resetSubtree();
    const list = root.find('/list')!;
    expect(list.value).toEqual([]);
    expect(list.outputValue).toBeUndefined();
    list.setValue(['a']);
    expect(list.value).toEqual(['a']);
    expect(root.value).toEqual({ list: ['a'] });
  });

  it('VALUE-034 LANDING-116 LANDING-171 keeps a loaded empty nested array empty', () => {
    const { root } = makeRecordTree({ type: 'object', properties: {
      items: { type: 'array', minItems: 3,
        items: { type: 'number', default: 0 } },
    } }, { snapshot: { items: [] } });
    root.resetSubtree();
    const items = root.find('/items')!;
    expect(items.value).toEqual([]);
    expect(items.outputValue).toBeUndefined();
    expect(root.value).toEqual({});
  });

  it('VALUE-034 LANDING-116 preserves a loaded partial array without minItems fill', () => {
    const { root } = makeRecordTree({ type: 'object', properties: {
      items: { type: 'array', minItems: 5,
        items: { type: 'number', default: 0 } },
    } }, { snapshot: { items: [1, 2] } });
    root.resetSubtree();
    expect(root.find('/items')?.value).toEqual([1, 2]);
    expect(root.value).toEqual({ items: [1, 2] });
  });

  it('VALUE-034 LANDING-116 leaves minItems unfilled on an empty load', () => {
    const { root } = makeRecordTree({ type: 'object', properties: {
      list: { type: 'array', minItems: 2,
        items: { type: 'string', default: 'S' } },
    } }, { snapshot: {} });
    root.resetSubtree();
    expect(root.find('/list')?.value).toEqual([]);
    expect(root.value).toEqual({});
  });

  it.each([false, true])(
    'VALUE-034 LANDING-116 LANDING-155 clears minItems array terminal=%s',
    (terminal) => {
      const { root } = makeRecordTree({ type: 'object', properties: {
        list: { type: 'array', minItems: 2, options: { terminal },
          items: { type: 'string', default: 'S' } },
      } }, { snapshot: { list: ['S', 'S'] } });
      root.resetSubtree();
      const list = root.find('/list')!;
      expect(list.value).toEqual(['S', 'S']);
      list.clear();
      expect(list.value).toEqual([]);
      expect(root.value).toEqual({});
      list.resetSubtree();
      expect(list.value).toEqual(terminal ? ['S', 'S'] : []);
    },
  );

  it('VALUE-034 keeps two empty virtual aggregation slots before input', () => {
    const { root } = makeRecordTree({ type: 'object', properties: {
      startDate: { type: 'string' }, endDate: { type: 'string' },
    }, options: { virtual: { period: { fields: ['startDate', 'endDate'] } } } },
    { snapshot: {} });
    root.resetSubtree();
    expect(root.find('/period')?.value).toEqual([undefined, undefined]);
    expect(root.outputValue).toEqual({});
  });

  it('VALUE-034 fills an unsupplied push slot when items has no default', () => {
    const { root } = makeRecordTree({ type: 'array',
      items: { type: 'string' } });
    expect(root.push()).toBe(1);
    expect(root.children?.map((item) => item.raw)).toEqual([undefined]);
    expect(root.value).toEqual([null]);
    expect(root.outputValue).toEqual([null]);
  });

  it('GOAL-074 restores omitTrailing slots from raw after branch reactivation', () => {
    const { root, runtime } = makeRecordTree({ type: 'object', properties: {
      active: { type: 'boolean' },
      tail: { type: 'array', controls: { active: '../active' },
        items: { type: 'string' }, options: { omitTrailing: true } },
    } });
    root.setValue({ active: true, tail: ['a', null, null] });
    expect(root.outputValue).toEqual({ active: true, tail: ['a'] });
    root.find('/active')?.setValue(false);
    const latent: Map<string, { raw?: unknown }> = Reflect.get(runtime, 'latentRaw');
    expect(latent.get(JSON.stringify(['/tail', 'array']))?.raw)
      .toEqual(['a', null, null]);
    root.find('/active')?.setValue(true);
    expect(root.find('/tail')?.children?.map((item) => item.raw))
      .toEqual(['a', null, null]);
    expect(root.find('/tail')?.children).toHaveLength(3);
    expect(root.outputValue).toEqual({ active: true, tail: ['a'] });
  });
});
