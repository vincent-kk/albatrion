import { afterEach, describe, expect, it, vi } from 'vitest';

import * as records from '../../record';
import { WriteOption } from '../../types/value';
import {
  dispatchPop,
  dispatchPush,
  dispatchRemove,
  dispatchSetValue,
} from '../../write';
import { arrangeFieldNodeItems, writeFieldNode } from '../index';
import { compareArraySelection } from './fixtures/compareArraySelection';
import { createTestTree } from './fixtures/createTestTree';

afterEach(() => vi.restoreAllMocks());

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

  it('retains full selection for a removal that moves prefix paths', () => {
    compareArraySelection(
      {
        type: 'array',
        items: { type: 'object', properties: { value: { type: 'string' } } },
      },
      [{ value: 'a' }, { value: 'b' }, { value: 'c' }],
      [{ apply: (node) => dispatchRemove(node, 0), reuse: false }],
    );
  });

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
