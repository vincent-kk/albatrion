import { describe, expect, it } from 'vitest';

import type { TestFieldNode } from '@/schema-form/core/__tests__/fixtures/testFieldNode';
import { isTestFieldNode } from '@/schema-form/core/__tests__/fixtures/testFieldNode';
import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchInsert,
  dispatchPush,
  dispatchResetSubtree,
  dispatchSetValue,
  readFieldNodeRevision,
} from '@/schema-form/core/engine/write';

import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { readFieldNodeDefaultValue } from '../../utils/loadValues/readFieldNodeDefaultValue';
import { writeFieldNode } from '../../utils/write/writeFieldNode';
import { arrangeFieldNodeItems } from '../arrangeFieldNodeItems';
import { compareArrayAppend } from './fixtures/compareArrayAppend';
import {
  compareArrayInsert,
  runArrayWrite,
} from './fixtures/compareArrayInsert';
import type { InsertRun } from './fixtures/compareArrayInsert';

/** Item nodes, keys, names and paths of a run's root array after its write. */
const itemsOf = (run: InsertRun) =>
  (run.root.children ?? []).map((item) => ({
    item,
    key: item.itemKey,
    name: item.name,
    path: item.path,
  }));

/**
 * Assert NODE-051 for an insert at `index`: the prefix keeps nodes and keys,
 * the inserted position is a new node with a new key, and the tail keeps nodes and keys
 * while only its names and paths move one position back.
 */
const expectInsertIdentity = (run: InsertRun, index: number) => {
  const items = itemsOf(run);
  expect(items).toHaveLength(run.before.length + 1);
  for (let position = 0; position < items.length; position++) {
    const { item, key, name, path } = items[position];
    expect(name).toBe(String(position));
    expect(path).toBe('/' + position);
    expect(item.parent).toBe(run.root);
    if (position === index) {
      expect(run.before).not.toContain(item);
      expect(key).toBeGreaterThan(Math.max(-1, ...run.keys.map(Number)));
      continue;
    }
    const from = position < index ? position : position - 1;
    expect(item).toBe(run.before[from]);
    expect(key).toBe(run.keys[from]);
  }
};

const STRINGS: BlueprintSchema = { type: 'array', items: { type: 'string' } };
const OBJECTS: BlueprintSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      n: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
    },
  },
};

// filid:contract settle-array-insert
describe('array insert', () => {
  describe('matches the whole write of the same array', () => {
    it('NODE-051 inserts in the middle with equal values, emissions, deliveries and host revisions', () => {
      const { inserted, whole, observe, defaults } = compareArrayInsert(
        STRINGS,
        ['a', 'b', 'c'],
        1,
        'x',
      );
      expect(inserted.result).toBe(4);
      expect(inserted.root.local).toEqual(['a', 'x', 'b', 'c']);
      expect(observe(inserted)).toEqual(observe(whole));
      expect(inserted.root.revisionLedger).toEqual(whole.root.revisionLedger);
      expectInsertIdentity(inserted, 1);
      expect(defaults).toEqual([
        ['', ['a', 'x', 'b', 'c']],
        ['/0', 'a'],
        ['/1', 'x'],
        ['/2', 'b'],
        ['/3', 'c'],
      ]);
      const [first, , second, third] = inserted.root.children!;
      expect(readFieldNodeRevision(first, FieldNodeEventType.UpdatePath)).toBe(
        0,
      );
      expect(readFieldNodeRevision(second, FieldNodeEventType.UpdatePath)).toBe(
        1,
      );
      expect(readFieldNodeRevision(third, FieldNodeEventType.UpdatePath)).toBe(
        1,
      );
      expect(first.revisionLedger).toEqual(
        whole.root.children![0].revisionLedger,
      );
    });

    it('NODE-051 35C-02 inserts at the front and moves nested descendants with their items', () => {
      const input = [
        { n: 'a', tags: ['t'] },
        { n: 'b', tags: [] },
      ];
      const { inserted, whole, observe, defaults, next } = compareArrayInsert(
        OBJECTS,
        input,
        0,
        { n: 'x', tags: ['y'] },
      );
      const grandchildren = inserted.before.map(
        (item) => item.structure?.['n'],
      );
      expect(inserted.result).toBe(3);
      expect(observe(inserted)).toEqual(observe(whole));
      expect(inserted.root.revisionLedger).toEqual(whole.root.revisionLedger);
      expectInsertIdentity(inserted, 0);
      expect(defaults[0]).toEqual(['', next]);
      grandchildren.forEach((grandchild, position) => {
        expect(inserted.root.children![position + 1].structure?.['n']).toBe(
          grandchild,
        );
        expect(grandchild?.path).toBe('/' + (position + 1) + '/n');
      });
      expect(
        inserted.root.children![1].structure?.['tags']?.children?.[0]?.path,
      ).toBe('/1/tags/0');
    });

    it('NODE-051 inserts at the last occupied position, shifting only the final item', () => {
      const { inserted, whole, observe } = compareArrayInsert(
        STRINGS,
        ['a', 'b', 'c'],
        2,
        'x',
      );
      expect(observe(inserted)).toEqual(observe(whole));
      expectInsertIdentity(inserted, 2);
    });
  });

  describe('insert at the length is push', () => {
    it('G8 takes the append path at N and matches the declined general path', () => {
      compareArrayAppend(
        STRINGS,
        ['a', 'b'],
        [
          { apply: (root) => dispatchInsert(root, 2, 'x'), append: true },
          { apply: (root) => dispatchInsert(root, 3, undefined), append: true },
          { apply: (root) => dispatchInsert(root, 0, 'y'), append: false },
        ],
      );
      compareArrayAppend(
        OBJECTS,
        [],
        [
          {
            apply: (root) => dispatchInsert(root, 0, { n: 'x' }),
            append: true,
          },
        ],
      );
    });

    it('returns, delivers, keys and snapshots exactly like push', () => {
      for (const [schema, input, value] of [
        [STRINGS, ['a', 'b'], 'x'],
        [STRINGS, [], undefined],
        [OBJECTS, [{ n: 'a' }], { n: 'x' }],
      ] as const) {
        const pushed = runArrayWrite(schema, input, (root) =>
          dispatchPush(root, value),
        );
        const inserted = runArrayWrite(schema, input, (root) =>
          dispatchInsert(root, input.length, value),
        );
        expect(inserted.result).toBe(pushed.result);
        expect(itemsOf(inserted).map(({ key, path }) => [key, path])).toEqual(
          itemsOf(pushed).map(({ key, path }) => [key, path]),
        );
        expect(inserted.root.local).toEqual(pushed.root.local);
        expect(inserted.root.emit).toEqual(pushed.root.emit);
        expect(inserted.root.runtime.loadSnapshot).toEqual(
          pushed.root.runtime.loadSnapshot,
        );
        expect(inserted.deliveredPaths).toEqual(pushed.deliveredPaths);
        expect(inserted.changes).toBe(pushed.changes);
        expect(inserted.root.revisionLedger).toEqual(
          pushed.root.revisionLedger,
        );
      }
    });
  });

  describe('boundaries', () => {
    it('35C-06 leaves the array untouched for a negative, larger, fractional or NaN index and returns the length', () => {
      for (const index of [-1, 4, 1.5, Number.NaN]) {
        const run = runArrayWrite(STRINGS, ['a', 'b', 'c'], (root) => {
          const local = root.local;
          const result = dispatchInsert(root, index, 'x');
          expect(root.local).toBe(local);
          return result;
        });
        expect(run.result).toBe(3);
        expect(run.deliveredPaths).toEqual([]);
        expect(run.changes).toBe(0);
        expect(run.root.runtime.loadSnapshot).toBe(run.snapshot);
        expect(run.root.children).toEqual(run.before);
        expect(run.root.runtime.errorReporter?.report).not.toHaveBeenCalled();
      }
    });

    it('47C-02 turns a non-array host into [x] at index 0 like push and ignores index 1', () => {
      for (const host of [5, null, { a: 1 }]) {
        const ignored = runArrayWrite(STRINGS, host, (root) =>
          dispatchInsert(root, 1, 'x'),
        );
        expect(ignored.result).toBe(0);
        expect(ignored.root.raw).toEqual(host);
        expect(ignored.deliveredPaths).toEqual([]);
        expect(ignored.changes).toBe(0);
        const inserted = runArrayWrite(STRINGS, host, (root) =>
          dispatchInsert(root, 0, 'x'),
        );
        const pushed = runArrayWrite(STRINGS, host, (root) =>
          dispatchPush(root, 'x'),
        );
        expect(inserted.result).toBe(1);
        expect(inserted.root.local).toEqual(['x']);
        expect(inserted.root.raw).toBeUndefined();
        expect(inserted.root.runtime.misfitPaths.size).toBe(0);
        expect(inserted.root.emit).toEqual(pushed.root.emit);
        expect(inserted.deliveredPaths).toEqual(pushed.deliveredPaths);
        expect(inserted.root.runtime.loadSnapshot).toEqual(
          pushed.root.runtime.loadSnapshot,
        );
      }
    });

    it('NODE-005 splices a terminal array copy and keeps the caller array', () => {
      const terminal: BlueprintSchema = {
        type: 'array',
        options: { terminal: true },
      };
      const input = ['a', 'b'];
      const run = runArrayWrite(terminal, input, (root) =>
        dispatchInsert(root, 1, 'x'),
      );
      expect(run.result).toBe(3);
      expect(run.root.raw).toEqual(['a', 'x', 'b']);
      expect(input).toEqual(['a', 'b']);
      const whole = runArrayWrite(terminal, input, (root) =>
        dispatchSetValue(root, ['a', 'x', 'b'], WriteOption.Overwrite),
      );
      expect(run.root.emit).toEqual(whole.root.emit);
      expect(run.deliveredPaths).toEqual(whole.deliveredPaths);
      for (const index of [-1, 3, 0.5])
        expect(
          runArrayWrite(terminal, input, (root) =>
            dispatchInsert(root, index, 'x'),
          ).result,
        ).toBe(2);
      const tail = runArrayWrite(terminal, input, (root) =>
        dispatchInsert(root, 2, 'x'),
      );
      const pushed = runArrayWrite(terminal, input, (root) =>
        dispatchPush(root, 'x'),
      );
      expect(tail.root.raw).toEqual(pushed.root.raw);
      expect(tail.result).toBe(pushed.result);
      const wrongKind = runArrayWrite(terminal, 7, (root) => [
        dispatchInsert(root, 1, 'x'),
        dispatchInsert(root, 0, 'x'),
      ]);
      expect(wrongKind.result).toEqual([0, 1]);
      expect(wrongKind.root.raw).toEqual(['x']);
    });
    it('NODE-044 sends a detached host insert to its latent whole write, like remove', () => {
      const { root } = createTestTree({
        type: 'object',
        properties: {
          show: { type: 'boolean' },
          list: {
            type: 'array',
            controls: { active: '../show' },
            items: { type: 'string' },
          },
        },
      });
      writeFieldNode(
        root,
        { show: true, list: ['a', 'b'] },
        'callerReplace',
        WriteOption.Overwrite,
      );
      const former = root.structure!.list;
      writeFieldNode(
        root.structure!.show,
        false,
        'callerReplace',
        WriteOption.Overwrite,
      );
      expect(former.detached).toBe(true);
      expect(
        arrangeFieldNodeItems(former, { kind: 'insert', index: 1, value: 'x' }),
      ).toBe(3);
      expect(
        arrangeFieldNodeItems(former, { kind: 'insert', index: 9, value: 'y' }),
      ).toBe(2);
      expect(
        root.runtime.latentRaw.get(JSON.stringify(['/list', 'array'])),
      ).toMatchObject({ raw: ['a', 'x', 'b'] });
      writeFieldNode(
        root.structure!.show,
        true,
        'callerReplace',
        WriteOption.Overwrite,
      );
      expect(root.structure!.list.local).toEqual(['a', 'x', 'b']);
    });
  });

  describe('load snapshot', () => {
    it('WRITE-085 WRITE-099 puts the creation value at i, shifts defaults and leaves the earlier snapshot alone', () => {
      const run = runArrayWrite(STRINGS, ['a', 'b', 'c'], (root) =>
        dispatchInsert(root, 1, 'x'),
      );
      expect(run.snapshot).toEqual(['a', 'b', 'c']);
      expect(run.root.runtime.loadSnapshot).toEqual(['a', 'x', 'b', 'c']);
      const items = run.root.children!;
      expect(items.map((item) => readFieldNodeDefaultValue(item))).toEqual([
        'a',
        'x',
        'b',
        'c',
      ]);
      dispatchSetValue(items[1], 'edited', WriteOption.Overwrite);
      dispatchResetSubtree(items[1], WriteOption.Overwrite);
      expect(items[1].local).toBe('x');
      expect(run.root.local).toEqual(['a', 'x', 'b', 'c']);
    });

    it('WRITE-088 WRITE-099 fills an omitted value from the item default and snapshots undefined', () => {
      const run = runArrayWrite(
        { type: 'array', items: { type: 'string', default: 'd' } },
        ['a', 'b'],
        (root) => dispatchInsert(root, 1),
      );
      expect(run.result).toBe(3);
      expect(run.root.local).toEqual(['a', 'd', 'b']);
      expect(run.root.runtime.loadSnapshot).toEqual(['a', undefined, 'b']);
      expect(run.snapshot).toEqual(['a', 'b']);
    });
  });

  describe('gates', () => {
    it('BLUEPRINT-007 18C-13 re-evaluates absolute and relative position readers in the shifted tail', () => {
      const schema: BlueprintSchema = {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                x: { type: 'string' },
                absolute: {
                  type: 'string',
                  controls: { visible: '/arr/0/x === "on"' },
                },
                relative: {
                  type: 'string',
                  controls: { visible: '../../0/x === "on"' },
                },
              },
            },
          },
        },
      };
      const input = {
        arr: [
          { x: 'off', absolute: 'a', relative: 'a' },
          { x: 'off', absolute: 'b', relative: 'b' },
        ],
      };
      const created = { x: 'on', absolute: 'n', relative: 'n' };
      const visibility = (root: { find: (path: string) => unknown }) =>
        [0, 1, 2].flatMap((position) =>
          ['absolute', 'relative'].map((field) => {
            const node = root.find(`/arr/${position}/${field}`);
            return isTestFieldNode(node) ? node.visible : undefined;
          }),
        );
      const inserted = makeFieldNodeTree(schema).root;
      inserted.setValue(input);
      const array = inserted.find('/arr');
      if (!isTestFieldNode(array)) throw new Error('Expected the array node');
      const record: TestFieldNode = array;
      const tail = record.children![1];
      expect(visibility(inserted)).toEqual([
        false,
        false,
        false,
        false,
        undefined,
        undefined,
      ]);
      expect(dispatchInsert(record, 0, created)).toBe(3);
      expect(record.children![2]).toBe(tail);
      const whole = makeFieldNodeTree(schema).root;
      whole.setValue(input);
      whole.setValue({ arr: [created, ...input.arr] });
      expect(visibility(inserted)).toEqual([
        true,
        true,
        true,
        true,
        true,
        true,
      ]);
      expect(visibility(inserted)).toEqual(visibility(whole));
      expect(inserted.value).toEqual(whole.value);
    });
  });
});
