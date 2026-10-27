import { describe, expect, it } from 'vitest';

import type { TestFieldNode } from '@/schema-form/core/__tests__/fixtures/testFieldNode';
import { isTestFieldNode } from '@/schema-form/core/__tests__/fixtures/testFieldNode';
import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { pinLatentBaseline } from '../../../__tests__/fixtures/pinLatentBaseline';
import { arrangeFieldNodeItems } from '../arrangeFieldNodeItems';

const makeRecordTree = (...args: Parameters<typeof makeFieldNodeTree>) => {
  const tree = makeFieldNodeTree(...args);
  if (!isTestFieldNode(tree.root))
    throw new Error('Expected a runtime FieldNode');
  const root = tree.root;
  return { ...tree, root };
};

// filid:contract settle-array
describe('array structural verbs', () => {
  it('SURFACE-005 GOAL-058 WRITE-099 applies push synchronously and snapshots its input', () => {
    const { root } = makeRecordTree(
      { type: 'array', items: { type: 'string' } },
      { snapshot: ['a'] },
    );
    const record: TestFieldNode = root;
    root.resetSubtree();
    const first = root.children![0];
    expect(arrangeFieldNodeItems(record, { kind: 'push', value: 'x' })).toBe(2);
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
    const { root } = makeRecordTree({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          supplied: { type: 'string', default: 'fill' },
          absent: { type: 'string', default: 'fill' },
        },
      },
    });
    const record: TestFieldNode = root;
    expect(
      arrangeFieldNodeItems(record, {
        kind: 'push',
        value: { supplied: 'caller' },
      }),
    ).toBe(1);
    expect(root.value).toEqual([{ supplied: 'caller', absent: 'fill' }]);
  });

  it('NODE-051 35C-02 shifts live identity, path, and interaction state on remove', () => {
    const { root, runtime } = makeRecordTree(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
      { snapshot: [{ name: 's0' }, { name: 's1' }, { name: 's2' }] },
    );
    const record: TestFieldNode = root;
    root.setValue([{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
    const first = root.children![0];
    const second = root.children![1];
    const grandchild = second.children![0];
    second.state = { ...second.state, dirty: true, touched: true };
    expect(arrangeFieldNodeItems(record, { kind: 'remove', index: 0 })).toEqual(
      {
        name: 'a',
      },
    );
    expect(first.detached).toBe(true);
    expect(root.children![0]).toBe(second);
    expect(second).toMatchObject({ name: '0', path: '/0', itemKey: 1 });
    expect(grandchild.path).toBe('/0/name');
    expect(second.state).toMatchObject({ dirty: true, touched: true });
    expect(root.value).toEqual([{ name: 'b' }, { name: 'c' }]);
    expect(Reflect.get(runtime, 'loadSnapshot')).toEqual([
      { name: 's1' },
      { name: 's2' },
    ]);
    expect(second.defaultValue).toEqual({ name: 's1' });
  });

  it('NODE-052 moves an extra into a newly templated position', () => {
    const { root } = makeRecordTree({
      type: 'array',
      prefixItems: [{ type: 'string' }, { type: 'string' }],
      items: false,
    });
    const record: TestFieldNode = root;
    root.setValue(['a', 'b', 'c', 'd']);
    const oldSecond = root.children![1];
    expect(arrangeFieldNodeItems(record, { kind: 'remove', index: 0 })).toBe(
      'a',
    );
    expect(root.value).toEqual(['b', 'c', 'd']);
    expect(oldSecond.detached).toBe(true);
    expect(root.children![0].value).toBe('b');
    expect(root.children![0].itemKey).toBeGreaterThan(oldSecond.itemKey!);
    expect(root.children![1].value).toBe('c');
    expect(root.children![1].itemKey).toBeGreaterThan(oldSecond.itemKey!);
    expect(root.undeclaredValues).toEqual(['d']);
  });

  it('NODE-052 gives a shifted value a new node when the slot template differs (41C-01)', () => {
    const { root } = makeRecordTree({
      type: 'array',
      prefixItems: [
        { type: 'string', minLength: 3 },
        { type: 'string', maxLength: 2 },
      ],
      items: false,
    });
    const record: TestFieldNode = root;
    root.setValue(['first', 'b']);
    const firstBlueprint = root.children![0].blueprintNode;
    const moved = root.children![1];
    expect(moved.blueprintNode).not.toBe(firstBlueprint);
    expect(arrangeFieldNodeItems(record, { kind: 'remove', index: 0 })).toBe(
      'first',
    );
    expect(root.value).toEqual(['b']);
    expect(root.children![0].blueprintNode).toBe(firstBlueprint);
    expect(root.children![0].itemKey).toBeGreaterThan(moved.itemKey!);
    expect(moved.detached).toBe(true);
  });

  it('35C-06 38C-01 47C-02 leaves null removals untouched, then pushes', () => {
    const { root, runtime } = makeRecordTree({
      type: 'array',
      items: { type: 'string' },
    });
    const record: TestFieldNode = root;
    root.setValue(['a']);
    const commit = Reflect.get(runtime, 'commitNumber');
    for (const index of [-1, 1, 0.5, NaN]) {
      expect(
        arrangeFieldNodeItems(record, { kind: 'remove', index }),
      ).toBeUndefined();
      expect(
        arrangeFieldNodeItems(record, { kind: 'update', index, value: 'x' }),
      ).toBeUndefined();
    }
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit);
    const former = root.children![0];
    root.setValue(null);
    const nullCommit = Reflect.get(runtime, 'commitNumber');
    expect(arrangeFieldNodeItems(record, { kind: 'pop' })).toBeUndefined();
    expect(
      arrangeFieldNodeItems(record, { kind: 'update', index: 0, value: 'x' }),
    ).toBeUndefined();
    expect(
      arrangeFieldNodeItems(record, { kind: 'remove', index: 0 }),
    ).toBeUndefined();
    expect(arrangeFieldNodeItems(record, { kind: 'clear' })).toBeUndefined();
    expect(root.outputValue).toBeNull();
    expect(Reflect.get(runtime, 'commitNumber')).toBe(nullCommit);
    expect(arrangeFieldNodeItems(record, { kind: 'push', value: 'x' })).toBe(1);
    expect(root.value).toEqual(['x']);
    expect(root.children![0].itemKey).toBeGreaterThan(former.itemKey!);
    expect(Reflect.get(runtime, 'commitNumber')).toBeGreaterThan(nullCommit);
    root.setValue(17);
    expect(arrangeFieldNodeItems(record, { kind: 'push', value: 'y' })).toBe(1);
    expect(root.value).toEqual(['y']);
  });

  it('NODE-005 applies terminal verbs to copies and returns committed values', () => {
    const { root } = makeRecordTree({
      type: 'array',
      options: { terminal: true },
    });
    const record: TestFieldNode = root;
    const original = ['a', 'b'];
    root.setValue(original);
    expect(
      arrangeFieldNodeItems(record, { kind: 'update', index: 0, value: 'x' }),
    ).toBe('x');
    expect(original).toEqual(['a', 'b']);
    expect(root.raw).not.toBe(original);
    expect(arrangeFieldNodeItems(record, { kind: 'pop' })).toBe('b');
    expect(arrangeFieldNodeItems(record, { kind: 'push', value: 'z' })).toBe(2);
    const beforeRemove = root.raw;
    expect(arrangeFieldNodeItems(record, { kind: 'remove', index: 0 })).toBe(
      'x',
    );
    expect(root.raw).not.toBe(beforeRemove);
    expect(root.value).toEqual(['z']);
    expect(arrangeFieldNodeItems(record, { kind: 'clear' })).toBeUndefined();
    expect(root.value).toEqual([]);
  });

  it('WRITE-085 updates a live item without replacing its key or snapshot slot', () => {
    const { root, runtime } = makeRecordTree(
      { type: 'array', items: { type: 'string' } },
      { snapshot: ['snapshot'] },
    );
    const record: TestFieldNode = root;
    root.resetSubtree();
    const item = root.children![0];
    const key = item.itemKey;
    expect(
      arrangeFieldNodeItems(record, {
        kind: 'update',
        index: 0,
        value: 'updated',
      }),
    ).toBe('updated');
    expect(root.children![0]).toBe(item);
    expect(item.itemKey).toBe(key);
    expect(item.defaultValue).toBe('snapshot');
    expect(Reflect.get(runtime, 'loadSnapshot')).toEqual(['snapshot']);
  });

  it('NODE-052 updates a blueprint-less tail through one host write', () => {
    const { root } = makeRecordTree({
      type: 'array',
      prefixItems: [{ type: 'string' }],
      items: false,
    });
    const record: TestFieldNode = root;
    root.setValue(['a', 'b']);
    const item = root.children![0];
    expect(
      arrangeFieldNodeItems(record, { kind: 'update', index: 1, value: 'c' }),
    ).toBe('c');
    expect(root.value).toEqual(['a', 'c']);
    expect(root.children![0]).toBe(item);
    expect(root.undeclaredValues).toEqual(['c']);
  });

  it('WRITE-085 updates a gated-out slot through the host raw tree', () => {
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
    const { root, runtime } = makeRecordTree({
      type: 'array',
      items: { type: 'string', controls: { active: 'false' } },
    });
    const record: TestFieldNode = root;
    root.setValue(['a']);
    expect(root.children).toEqual([]);
    expect(
      arrangeFieldNodeItems(record, { kind: 'update', index: 0, value: 'b' }),
    ).toBe('b');
    const latent: Map<string, unknown> = Reflect.get(runtime, 'latentRaw');
    expect(latent.get(JSON.stringify(['/0', 'string']))).toBe('b');
  });

  it('GOAL-073 keeps creation keys increasing through pop, push, and clear', () => {
    const { root, runtime } = makeRecordTree({
      type: 'array',
      items: { type: 'string' },
    });
    const record: TestFieldNode = root;
    root.setValue(['a']);
    const first = root.children![0];
    arrangeFieldNodeItems(record, { kind: 'push', value: 'b' });
    const second = root.children![1];
    expect(arrangeFieldNodeItems(record, { kind: 'pop' })).toBe('b');
    expect(second.detached).toBe(true);
    arrangeFieldNodeItems(record, { kind: 'push', value: 'c' });
    const third = root.children![1];
    expect(third.itemKey).toBeGreaterThan(second.itemKey!);
    expect(arrangeFieldNodeItems(record, { kind: 'clear' })).toBeUndefined();
    expect(first.detached).toBe(true);
    expect(third.detached).toBe(true);
    expect(root.children).toEqual([]);
    expect(Reflect.get(runtime, 'loadSnapshot')).toEqual([]);
  });

  it('35C-06 47C-02 pushes on terminal null and undefined while other verbs are no-ops', () => {
    const { root, runtime } = makeRecordTree({
      type: 'array',
      options: { terminal: true },
    });
    const record: TestFieldNode = root;
    expect(arrangeFieldNodeItems(record, { kind: 'pop' })).toBeUndefined();
    root.setValue(null);
    const commit = Reflect.get(runtime, 'commitNumber');
    expect(arrangeFieldNodeItems(record, { kind: 'pop' })).toBeUndefined();
    expect(
      arrangeFieldNodeItems(record, { kind: 'update', index: 0, value: 'x' }),
    ).toBeUndefined();
    expect(
      arrangeFieldNodeItems(record, { kind: 'remove', index: 0 }),
    ).toBeUndefined();
    expect(arrangeFieldNodeItems(record, { kind: 'clear' })).toBeUndefined();
    expect(root.raw).toBeNull();
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit);
    expect(arrangeFieldNodeItems(record, { kind: 'push', value: 'x' })).toBe(1);
    expect(root.raw).toEqual(['x']);
    root.setValue(undefined);
    expect(arrangeFieldNodeItems(record, { kind: 'push', value: 'y' })).toBe(1);
    expect(root.raw).toEqual(['y']);
  });

  it('48C-02 pushes over a terminal wrong-kind value and clears its warning', () => {
    const { root, runtime } = makeRecordTree({
      type: 'array',
      options: { terminal: true },
    });
    const record: TestFieldNode = root;
    root.setValue(17);
    expect(root.misfit).toBe(true);
    const commit = Reflect.get(runtime, 'commitNumber');
    expect(arrangeFieldNodeItems(record, { kind: 'clear' })).toBeUndefined();
    expect(arrangeFieldNodeItems(record, { kind: 'pop' })).toBeUndefined();
    expect(root.raw).toBe(17);
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit);
    expect(arrangeFieldNodeItems(record, { kind: 'push', value: 'x' })).toBe(1);
    expect(root.raw).toEqual(['x']);
    expect(root.misfit).toBe(false);
  });

  it('47C-01 keeps nested array slots and live identity on a tuple tail update', () => {
    const { root } = makeRecordTree({
      type: 'array',
      prefixItems: [
        {
          type: 'array',
          items: { type: 'object', properties: { a: { type: 'string' } } },
        },
      ],
      items: false,
    });
    const record: TestFieldNode = root;
    root.setValue([[{}, {}], 'b']);
    const nested = root.find('/0/1');
    expect(nested).not.toBeNull();
    expect(
      arrangeFieldNodeItems(record, { kind: 'update', index: 1, value: 'c' }),
    ).toBe('c');
    expect(root.value).toEqual([[{}, {}], 'c']);
    expect(root.find('/0/1')).toBe(nested);
  });

  it('47C-01 updates a gated slot through the raw tree without dropping nested slots', () => {
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
    const { root, runtime } = makeRecordTree({
      type: 'array',
      prefixItems: [
        {
          type: 'array',
          items: { type: 'object', properties: { a: { type: 'string' } } },
        },
        { type: 'string', controls: { active: 'false' } },
      ],
      items: false,
    });
    const record: TestFieldNode = root;
    root.setValue([[{}, {}], 'b']);
    const nested = root.find('/0/1');
    expect(root.find('/1')).toBeNull();
    expect(
      arrangeFieldNodeItems(record, { kind: 'update', index: 1, value: 'c' }),
    ).toBe('c');
    expect(root.value).toEqual([[{}, {}], null]);
    expect(root.find('/0/1')).toBe(nested);
    const latent: Map<string, unknown> = Reflect.get(runtime, 'latentRaw');
    expect(latent.get(JSON.stringify(['/1', 'string']))).toBe('c');
  });
});
