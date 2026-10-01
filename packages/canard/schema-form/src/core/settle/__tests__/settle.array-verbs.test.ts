import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import type { SchemaNode as RuntimeSchemaNode } from '../../SchemaNode/SchemaNode';
import { arrangeSchemaNodeItems } from '../index';

const makeRecordTree = (...args: Parameters<typeof makeSchemaNodeTree>) => {
  const tree = makeSchemaNodeTree(...args);
  return { ...tree, root: tree.root as unknown as RuntimeSchemaNode };
};

// filid:contract settle-array
describe('array structural verbs', () => {
  it('SURFACE-005 GOAL-058 WRITE-099 applies push synchronously and snapshots its input', () => {
    const { root } = makeRecordTree({ type: 'array', items: { type: 'string' } },
      { snapshot: ['a'] });
    root.resetSubtree();
    const first = root.children![0];
    expect(arrangeSchemaNodeItems(root, { kind: 'push', value: 'x' })).toBe(2);
    expect(root.value).toEqual(['a', 'x']);
    expect(root.children![0]).toBe(first);
    const added = root.children![1];
    expect(added.itemKey).toBeGreaterThan(first.itemKey!);
    expect(added.defaultValue).toBe('x');
    added.setValue('edited');
    added.resetSubtree();
    expect(added.value).toBe('x');
  });

  it('WRITE-088 fills only absent descendants of a new item', () => {
    const { root } = makeRecordTree({ type: 'array', items: {
      type: 'object', properties: {
        supplied: { type: 'string', default: 'fill' },
        absent: { type: 'string', default: 'fill' },
      },
    } });
    expect(arrangeSchemaNodeItems(root, { kind: 'push',
      value: { supplied: 'caller' } })).toBe(1);
    expect(root.value).toEqual([{ supplied: 'caller', absent: 'fill' }]);
  });

  it('NODE-051 35C-02 shifts live identity, path, and interaction state on remove', () => {
    const { root, runtime } = makeRecordTree({ type: 'array', items: {
      type: 'object', properties: { name: { type: 'string' } },
    } }, { snapshot: [{ name: 's0' }, { name: 's1' }, { name: 's2' }] });
    root.setValue([{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
    const first = root.children![0];
    const second = root.children![1];
    const grandchild = second.children![0];
    second.state = { ...second.state, dirty: true, touched: true };
    expect(arrangeSchemaNodeItems(root, { kind: 'remove', index: 0 }))
      .toEqual({ name: 'a' });
    expect(first.detached).toBe(true);
    expect(root.children![0]).toBe(second);
    expect(second).toMatchObject({ name: '0', path: '/0', itemKey: 1 });
    expect(grandchild.path).toBe('/0/name');
    expect(second.state).toMatchObject({ dirty: true, touched: true });
    expect(root.value).toEqual([{ name: 'b' }, { name: 'c' }]);
    expect(Reflect.get(runtime, 'loadSnapshot')).toEqual([
      { name: 's1' }, { name: 's2' },
    ]);
    expect(second.defaultValue).toEqual({ name: 's1' });
  });

  it('NODE-052 moves an extra into a newly templated position', () => {
    const { root } = makeRecordTree({ type: 'array',
      prefixItems: [{ type: 'string' }, { type: 'string' }], items: false });
    root.setValue(['a', 'b', 'c', 'd']);
    const oldSecond = root.children![1];
    expect(arrangeSchemaNodeItems(root, { kind: 'remove', index: 0 })).toBe('a');
    expect(root.value).toEqual(['b', 'c', 'd']);
    expect(oldSecond.detached).toBe(true);
    expect(root.children![0].value).toBe('b');
    expect(root.children![0].itemKey).toBeGreaterThan(oldSecond.itemKey!);
    expect(root.children![1].value).toBe('c');
    expect(root.children![1].itemKey).toBeGreaterThan(oldSecond.itemKey!);
    expect(root.extras).toEqual(['d']);
  });

  it('NODE-052 uses the destination blueprint when tuple schemas differ', () => {
    const { root } = makeRecordTree({ type: 'array', prefixItems: [
      { type: 'string', minLength: 3 }, { type: 'string', maxLength: 2 },
    ], items: false });
    root.setValue(['first', 'b']);
    const firstBlueprint = root.children![0].blueprintNode;
    const moved = root.children![1];
    expect(moved.blueprintNode).not.toBe(firstBlueprint);
    expect(arrangeSchemaNodeItems(root, { kind: 'remove', index: 0 }))
      .toBe('first');
    expect(root.value).toEqual(['b']);
    expect(root.children![0].blueprintNode).toBe(firstBlueprint);
    expect(moved.detached).toBe(true);
  });

  it('35C-06 leaves invalid operations and a null branch untouched', () => {
    const { root, runtime } = makeRecordTree({ type: 'array',
      items: { type: 'string' } });
    root.setValue(['a']);
    const commit = Reflect.get(runtime, 'commitNumber');
    for (const index of [-1, 1, 0.5, NaN]) {
      expect(arrangeSchemaNodeItems(root, { kind: 'remove', index })).toBeUndefined();
      expect(arrangeSchemaNodeItems(root, { kind: 'update', index, value: 'x' }))
        .toBeUndefined();
    }
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit);
    root.setValue(null);
    const nullCommit = Reflect.get(runtime, 'commitNumber');
    expect(arrangeSchemaNodeItems(root, { kind: 'push', value: 'x' })).toBe(0);
    expect(arrangeSchemaNodeItems(root, { kind: 'pop' })).toBeUndefined();
    expect(arrangeSchemaNodeItems(root, { kind: 'update', index: 0,
      value: 'x' })).toBeUndefined();
    expect(arrangeSchemaNodeItems(root, { kind: 'remove', index: 0 }))
      .toBeUndefined();
    expect(arrangeSchemaNodeItems(root, { kind: 'clear' })).toBeUndefined();
    expect(root.outputValue).toBeNull();
    expect(Reflect.get(runtime, 'commitNumber')).toBe(nullCommit);
  });

  it('NODE-005 applies terminal verbs to copies and returns committed values', () => {
    const { root } = makeRecordTree({ type: 'array',
      options: { terminal: true } });
    const original = ['a', 'b'];
    root.setValue(original);
    expect(arrangeSchemaNodeItems(root, { kind: 'update', index: 0,
      value: 'x' })).toBe('x');
    expect(original).toEqual(['a', 'b']);
    expect(root.raw).not.toBe(original);
    expect(arrangeSchemaNodeItems(root, { kind: 'pop' })).toBe('b');
    expect(arrangeSchemaNodeItems(root, { kind: 'push', value: 'z' })).toBe(2);
    const beforeRemove = root.raw;
    expect(arrangeSchemaNodeItems(root, { kind: 'remove', index: 0 }))
      .toBe('x');
    expect(root.raw).not.toBe(beforeRemove);
    expect(root.value).toEqual(['z']);
    expect(arrangeSchemaNodeItems(root, { kind: 'clear' })).toBeUndefined();
    expect(root.value).toEqual([]);
  });

  it('WRITE-085 updates a live item without replacing its key or snapshot slot', () => {
    const { root, runtime } = makeRecordTree({ type: 'array',
      items: { type: 'string' } }, { snapshot: ['snapshot'] });
    root.resetSubtree();
    const item = root.children![0];
    const key = item.itemKey;
    expect(arrangeSchemaNodeItems(root, { kind: 'update', index: 0,
      value: 'updated' })).toBe('updated');
    expect(root.children![0]).toBe(item);
    expect(item.itemKey).toBe(key);
    expect(item.defaultValue).toBe('snapshot');
    expect(Reflect.get(runtime, 'loadSnapshot')).toEqual(['snapshot']);
  });

  it('NODE-052 updates a blueprint-less tail through one host write', () => {
    const { root } = makeRecordTree({ type: 'array',
      prefixItems: [{ type: 'string' }], items: false });
    root.setValue(['a', 'b']);
    const item = root.children![0];
    expect(arrangeSchemaNodeItems(root, { kind: 'update', index: 1,
      value: 'c' })).toBe('c');
    expect(root.value).toEqual(['a', 'c']);
    expect(root.children![0]).toBe(item);
    expect(root.extras).toEqual(['c']);
  });

  it('WRITE-085 updates a gated-out slot through the host raw tree', () => {
    const { root, runtime } = makeRecordTree({ type: 'array',
      items: { type: 'string', controls: { active: 'false' } } });
    root.setValue(['a']);
    expect(root.children).toEqual([]);
    expect(arrangeSchemaNodeItems(root, { kind: 'update', index: 0,
      value: 'b' })).toBe('b');
    const latent: Map<string, unknown> = Reflect.get(runtime, 'latentRaw');
    expect(latent.get(JSON.stringify(['/0', 'string']))).toBe('b');
  });

  it('GOAL-073 keeps creation keys increasing through pop, push, and clear', () => {
    const { root, runtime } = makeRecordTree({ type: 'array',
      items: { type: 'string' } });
    root.setValue(['a']);
    const first = root.children![0];
    arrangeSchemaNodeItems(root, { kind: 'push', value: 'b' });
    const second = root.children![1];
    expect(arrangeSchemaNodeItems(root, { kind: 'pop' })).toBe('b');
    expect(second.detached).toBe(true);
    arrangeSchemaNodeItems(root, { kind: 'push', value: 'c' });
    const third = root.children![1];
    expect(third.itemKey).toBeGreaterThan(second.itemKey!);
    expect(arrangeSchemaNodeItems(root, { kind: 'clear' })).toBeUndefined();
    expect(first.detached).toBe(true);
    expect(third.detached).toBe(true);
    expect(root.children).toEqual([]);
    expect(Reflect.get(runtime, 'loadSnapshot')).toEqual([]);
  });

  it('35C-06 treats an empty pop and all terminal null verbs as no-ops', () => {
    const { root, runtime } = makeRecordTree({ type: 'array',
      options: { terminal: true } });
    expect(arrangeSchemaNodeItems(root, { kind: 'pop' })).toBeUndefined();
    root.setValue(null);
    const commit = Reflect.get(runtime, 'commitNumber');
    expect(arrangeSchemaNodeItems(root, { kind: 'push', value: 'x' })).toBe(0);
    expect(arrangeSchemaNodeItems(root, { kind: 'pop' })).toBeUndefined();
    expect(arrangeSchemaNodeItems(root, { kind: 'update', index: 0,
      value: 'x' })).toBeUndefined();
    expect(arrangeSchemaNodeItems(root, { kind: 'remove', index: 0 }))
      .toBeUndefined();
    expect(arrangeSchemaNodeItems(root, { kind: 'clear' })).toBeUndefined();
    expect(root.raw).toBeNull();
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit);
  });
});
