import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchInsert,
  dispatchMount,
  dispatchPop,
  dispatchPush,
  dispatchRemove,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import type { PlainNode } from '../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import * as records from '../../record';
import { arrangeFieldNodeItems } from '../arrangeFieldNodeItems';
import * as ids from '../utils/compute/childSelection/staticIds';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { compareArraySelection } from './fixtures/compareArraySelection';

afterEach(() => vi.restoreAllMocks());

/** Static object items: no gate, expression, derive or watch, so a middle verb is admitted to the splice path. */
const STATIC_ITEMS: BlueprintSchema = {
  type: 'array',
  items: { type: 'object', properties: { value: { type: 'string' } } },
};

/** Six static items, so N/2 = 3 and N-2 = 4. */
const SIX = Array.from({ length: 6 }, (_, value) => ({ value: String(value) }));

// filid:contract settle-array-selection-reuse
describe('static array selection matches the full route', () => {
  it('appends nested items and fills new descendants without reselecting the prefix', () => {
    const root = compareArraySelection(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            value: { type: 'string' },
            fill: { type: 'number', default: 7 },
            nested: { type: 'array', items: { type: 'number' } },
          },
        },
      },
      [{ value: 'old', nested: [1, 2] }],
      [
        {
          apply: (node) => dispatchPush(node, { value: 'new', nested: [3] }),
          reuse: true,
        },
        { apply: (node) => dispatchPush(node, {}), reuse: true },
      ],
    );
    expect(root.emit).toEqual([
      { value: 'old', fill: 7, nested: [1, 2] },
      { value: 'new', fill: 7, nested: [3] },
      { fill: 7 },
    ]);
  });

  it('removes the last item and the final item with identical delivered changes and reads', () => {
    const root = compareArraySelection(
      {
        type: 'array',
        items: { type: 'object', properties: { value: { type: 'string' } } },
      },
      [{ value: 'first' }, { value: 'last' }],
      [
        { apply: (node) => dispatchRemove(node, 1), reuse: true },
        { apply: (node) => dispatchPop(node), reuse: true },
      ],
    );
    expect(root.emit).toEqual([]);
  });

  it('preserves tuple extras, dense undefined slots and projection on append and pop', () => {
    compareArraySelection(
      {
        type: 'array',
        prefixItems: [{ type: 'string' }],
        items: false,
        options: { omitTrailing: true },
      },
      ['kept', undefined, 'extra'],
      [
        { apply: (node) => dispatchPush(node, undefined), reuse: true },
        { apply: (node) => dispatchPop(node), reuse: true },
      ],
    );
  });

  it('keeps wrong-kind child warning records while adding another item', () => {
    compareArraySelection(
      { type: 'array', items: { type: 'number' } },
      ['wrong'],
      [
        { apply: (node) => dispatchPush(node, 'also wrong'), reuse: true },
        { apply: (node) => dispatchPop(node), reuse: true },
      ],
    );
  });

  it('keeps gate evaluation and revisits a child when its gate input changes', () => {
    const root = compareArraySelection(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            show: { type: 'boolean' },
            value: {
              type: 'string',
              default: 'filled',
              controls: { active: '../show' },
            },
          },
        },
      },
      [{ show: false }],
      [
        { apply: (node) => dispatchPush(node, { show: true }), reuse: false },
        {
          apply: (node) =>
            dispatchSetValue(
              node.structure!['0'].structure!.show,
              true,
              WriteOption.Overwrite,
            ),
          reuse: false,
        },
      ],
    );
    expect(root.emit).toEqual([
      { show: true, value: 'filled' },
      { show: true, value: 'filled' },
    ]);
  });

  it('recomputes a derived child when its existing source changes', () => {
    const root = compareArraySelection(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            source: { type: 'number' },
            doubled: { type: 'number', controls: { derived: '../source * 2' } },
          },
        },
      },
      [{ source: 2 }],
      [
        { apply: (node) => dispatchPush(node, { source: 3 }), reuse: false },
        {
          apply: (node) =>
            dispatchSetValue(
              node.structure!['0'].structure!.source,
              4,
              WriteOption.Overwrite,
            ),
          reuse: false,
        },
      ],
    );
    expect(root.emit).toEqual([
      { source: 4, doubled: 8 },
      { source: 3, doubled: 6 },
    ]);
  });

  it('retains full selection for a function injection without expression strings', () => {
    const root = compareArraySelection(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            source: {
              type: 'number',
              controls: {
                injectTo: (value: unknown) => ({ '../target': value }),
              },
            },
            target: { type: 'number' },
          },
        },
      },
      [{ source: 2 }],
      [{ apply: (node) => dispatchPush(node, { source: 3 }), reuse: false }],
    );
    expect(root.emit).toEqual([
      { source: 2, target: 2 },
      { source: 3, target: 3 },
    ]);
  });

  it('retains full selection for a branchless form with a visibility expression', () => {
    const root = compareArraySelection(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            flag: { type: 'boolean' },
            value: { type: 'string', controls: { visible: '../flag' } },
          },
        },
      },
      [{ flag: true, value: 'a' }],
      [
        {
          apply: (node) => dispatchPush(node, { flag: false, value: 'b' }),
          reuse: false,
        },
      ],
    );
    expect(root.emit).toEqual([
      { flag: true, value: 'a' },
      { flag: false, value: 'b' },
    ]);
  });

  it('reuses a non-root array without changing ancestor deliveries', () => {
    const root = compareArraySelection(
      {
        type: 'object',
        properties: {
          rows: { type: 'array', items: { type: 'number' } },
          sibling: { type: 'string' },
        },
      },
      { rows: [1, 2], sibling: 'same' },
      [
        { apply: (node) => dispatchPush(node.structure!.rows, 3), reuse: true },
        { apply: (node) => dispatchPop(node.structure!.rows), reuse: true },
      ],
    );
    expect(root.emit).toEqual({ rows: [1, 2], sibling: 'same' });
  });

  it('retains full selection for a removal that moves paths under a gate or an expression', () => {
    for (const controls of [{ active: '../flag' }, { visible: '../flag' }])
      compareArraySelection(
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              flag: { type: 'boolean' },
              value: { type: 'string', controls },
            },
          },
        },
        [
          { flag: true, value: 'a' },
          { flag: false, value: 'b' },
          { flag: true, value: 'c' },
        ],
        [{ apply: (node) => dispatchRemove(node, 0), reuse: false }],
      );
  });

  it.each<[string, (node: PlainNode, index: number) => unknown, number]>([
    ['removal', (node, index) => dispatchRemove(node, index), -1],
    [
      'insertion',
      (node, index) => dispatchInsert(node, index, { value: 'new' }),
      1,
    ],
  ])(
    'reuses selection for a static middle %s that moves paths and republishes only the tail entries at 0, 1, N/2 and N-2',
    (_, verb, delta) => {
      for (const index of [0, 1, 3, 4]) {
        compareArraySelection(STATIC_ITEMS, SIX, [
          { apply: (node) => verb(node, index), reuse: true },
        ]);
        const { root } = createTestTree(STATIC_ITEMS);
        dispatchMount(root, SIX, WriteOption.Overwrite, {
          deferValidation: true,
        });
        const published = vi.spyOn(ids, 'staticIds');
        verb(root, index);
        const positions = published.mock.calls
          .map(([entry]) => entry.name)
          .filter((name) => /^\d+$/.test(name));
        published.mockRestore();
        expect(positions).toEqual(
          Array.from({ length: SIX.length + delta - index }, (_, offset) =>
            String(index + offset),
          ),
        );
      }
    },
  );

  it('retains full selection for whole replacement and a wrong-kind host', () => {
    compareArraySelection(
      { type: 'array', items: { type: 'number' } },
      [1, 2],
      [
        {
          apply: (node) =>
            dispatchSetValue(node, [3, 4, 5], WriteOption.Overwrite),
          reuse: false,
        },
      ],
    );
    compareArraySelection({ type: 'array', items: { type: 'number' } }, null, [
      { apply: (node) => dispatchPush(node, 3), reuse: false },
    ]);
  });

  it('preserves a throwing gate record and uses full selection', () => {
    compareArraySelection(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            show: { type: 'boolean' },
            value: {
              type: 'string',
              controls: {
                active: '(() => { throw new Error("selection failure"); })()',
              },
            },
          },
        },
      },
      [{ show: true }],
      [{ apply: (node) => dispatchPush(node, { show: false }), reuse: false }],
    );
  });

  it('eliminates every retained item selection body and leaves dirty tail computation intact', () => {
    const { root, visits } = createTestTree({
      type: 'array',
      items: {
        type: 'object',
        properties: { value: { type: 'number' } },
      },
    });
    writeFieldNode(
      root,
      Array.from({ length: 100 }, (_, value) => ({ value })),
      'callerReplace',
      WriteOption.Overwrite,
    );
    const prefix = [...(root.children ?? [])];
    const capture = vi.spyOn(records, 'captureFieldNodeChange');
    visits.length = 0;
    arrangeFieldNodeItems(root, { kind: 'push', value: { value: 100 } });
    for (const child of prefix) {
      expect(
        capture.mock.calls.filter(
          ([node, field]) => node === child && field === 'active',
        ),
      ).toHaveLength(0);
      expect(visits.filter((path) => path === child.path)).toHaveLength(0);
      expect(root.structure![child.name]).toBe(child);
    }
    expect(visits.filter((path) => /^select:\/\d+$/.test(path))).toHaveLength(
      0,
    );
    expect(visits.filter((path) => path === '/100')).toHaveLength(1);
    expect(visits.filter((path) => path === '/100/value')).toHaveLength(1);
    capture.mockClear();
    visits.length = 0;
    arrangeFieldNodeItems(root, { kind: 'remove', index: 100 });
    expect(
      capture.mock.calls.filter(
        ([node, field]) =>
          prefix.some((child) => child === node) && field === 'active',
      ),
    ).toHaveLength(0);
    expect(
      visits.filter((path) => prefix.some((child) => child.path === path)),
    ).toHaveLength(0);
    expect(visits.filter((path) => /^select:\/\d+$/.test(path))).toHaveLength(
      0,
    );
    expect(root.children).toEqual(prefix);
  });
});
