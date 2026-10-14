import { describe, expect, it } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';

import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchRemove } from '../utils/entry/dispatchRemove';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { readFieldNodeRevision } from '../utils/read/readFieldNodeRevision';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';

/** Find a direct child record by name. */
const child = (node: DispatchTestNode | undefined, name: string) =>
  node?.children?.find((entry) => entry.name === name);

describe('66C-01 SETTLE-043 sameValue judges delivery changes', () => {
  it('delivers no UpdateValue to a NaN leaf whose computed flags change', () => {
    const { root } = createDispatchTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['c'], controls: { disabled: '#/flag' } }],
      },
      properties: { flag: { type: 'boolean' }, c: { type: 'number' } },
    });
    dispatchMount(root, { flag: false, c: NaN });
    const c = child(root, 'c');
    const flag = child(root, 'flag');
    if (!c || !flag) throw new Error('Mounted fields are missing');
    const types: number[] = [];
    subscribeFieldNode(c, (event) => {
      types.push(event.type);
    });
    const before = readFieldNodeRevision(c, FieldNodeEventType.UpdateValue);
    dispatchSetValue(flag, true);
    expect(types.some((type) => type & FieldNodeEventType.UpdateValue)).toBe(
      false,
    );
    expect(readFieldNodeRevision(c, FieldNodeEventType.UpdateValue)).toBe(
      before,
    );
  });

  it('delivers only UpdatePath to a NaN item shifted by remove', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        list: { type: 'array', items: { type: 'number' } },
      },
    });
    dispatchMount(root, { list: [1, NaN] });
    const list = child(root, 'list');
    const item = list?.children?.[1];
    if (!list || !item) throw new Error('Mounted item is missing');
    const types: number[] = [];
    subscribeFieldNode(item, (event) => {
      types.push(event.type);
    });
    const before = readFieldNodeRevision(item, FieldNodeEventType.UpdateValue);
    dispatchRemove(list, 0);
    expect(types.some((type) => type & FieldNodeEventType.UpdatePath)).toBe(
      true,
    );
    expect(types.some((type) => type & FieldNodeEventType.UpdateValue)).toBe(
      false,
    );
    expect(readFieldNodeRevision(item, FieldNodeEventType.UpdateValue)).toBe(
      before,
    );
  });

  it('delivers no UpdateValue to a NaN watcher whose watched source changes', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        src: { type: 'string' },
        w: { type: 'number', controls: { watch: ['../src'] } },
      },
    });
    dispatchMount(root, { src: 'a', w: NaN });
    const src = child(root, 'src');
    const watcher = child(root, 'w');
    if (!src || !watcher) throw new Error('Mounted fields are missing');
    const types: number[] = [];
    subscribeFieldNode(watcher, (event) => {
      types.push(event.type);
    });
    dispatchSetValue(src, 'b');
    expect(
      types.some(
        (type) => type & FieldNodeEventType.UpdateControlledProperties,
      ),
    ).toBe(true);
    expect(types.some((type) => type & FieldNodeEventType.UpdateValue)).toBe(
      false,
    );
  });

  it('delivers no UpdateControlledProperties when a shifted watcher keeps a NaN watch tuple', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              n: { type: 'number' },
              w: { type: 'string', controls: { watch: ['../n'] } },
            },
          },
        },
      },
    });
    dispatchMount(root, {
      rows: [
        { n: 1, w: 'a' },
        { n: NaN, w: 'b' },
      ],
    });
    const rows = child(root, 'rows');
    const watcher = child(rows?.children?.[1], 'w');
    if (!rows || !watcher) throw new Error('Mounted watcher is missing');
    const types: number[] = [];
    subscribeFieldNode(watcher, (event) => {
      types.push(event.type);
    });
    dispatchRemove(rows, 0);
    expect(types.some((type) => type & FieldNodeEventType.UpdatePath)).toBe(
      true,
    );
    expect(
      types.some(
        (type) => type & FieldNodeEventType.UpdateControlledProperties,
      ),
    ).toBe(false);
  });
});
