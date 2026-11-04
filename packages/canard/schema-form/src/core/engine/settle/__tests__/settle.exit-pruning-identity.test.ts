import { describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { find } from '@/schema-form/core/engine/navigation';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
  subscribeFieldNode,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import { getGateRegistry } from '../utils/gates/getGateRegistry';

/**
 * Object item whose `note` is gated by the given expression.
 * @param gate - `active` expression of `note`, relative to `note`
 * @returns Item declaration with `on` and the gated `note`
 */
const gatedItem = (gate: string): BlueprintSchema => ({
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    note: { type: 'string', controls: { active: gate } },
  },
});

/** Notes open only while the item at position 0 has `on === true`. */
const FIRST_ON = '../../0/on === true';

/**
 * Mount a tree and return the live node at a path.
 * @param schema - Authored root schema
 * @param value - Mounted value
 * @returns The root and a reader that fails on a missing live path
 */
const mount = (schema: BlueprintSchema, value: unknown) => {
  const { root } = createDispatchTree(schema);
  dispatchMount(root, value, WriteOption.Overwrite);
  const at = (path: string): DispatchTestNode => {
    const node = find(root, path);
    if (!node) throw new Error(`No live node at ${path}`);
    return node;
  };
  return { root, at };
};

/**
 * Record the path payloads one node receives.
 * @param node - Subscribed occurrence
 * @returns Live list of delivered `UpdatePath` payloads
 */
const pathDeliveries = (node: DispatchTestNode): unknown[] => {
  const deliveries: unknown[] = [];
  subscribeFieldNode(node, (event) => {
    if (event.type & FieldNodeEventType.UpdatePath)
      deliveries.push(event.payload?.[FieldNodeEventType.UpdatePath]);
  });
  return deliveries;
};

/**
 * Whether the gate registry holds a string node at a path.
 * @param root - Tree root whose runtime owns the registry
 * @param path - Absolute path
 * @returns The registry's answer for `(path, 'string')`
 */
const registered = (root: DispatchTestNode, path: string) =>
  getGateRegistry(root.runtime).hasRegisteredPathKind(path, 'string');

// filid:contract settle-exit-pruning-identity
describe('NODE-044 pending exits are pruned at perish by node identity', () => {
  it('detaches an exiting field moved by remove onto the perished item path', () => {
    const { root, at } = mount(
      {
        type: 'object',
        properties: { rows: { type: 'array', items: gatedItem(FIRST_ON) } },
      },
      {
        rows: [
          { on: true, note: 'n0' },
          { on: false, note: 'n1' },
        ],
      },
    );
    const moved = at('/rows/1/note');
    const deliveries = pathDeliveries(moved);
    expect(registered(root, '/rows/0/note')).toBe(true);
    dispatchRemove(at('/rows'), 0);
    expect(root.emit).toEqual({ rows: [{ on: false }] });
    expect(moved.detached).toBe(true);
    expect(moved.isActive).toBe(false);
    expect(moved.path).toBe('/rows/0/note');
    expect(at('/rows/0').children).not.toContain(moved);
    expect(registered(root, '/rows/0/note')).toBe(false);
    expect(deliveries).toEqual([]);
    expect(Reflect.get(root, 'inactiveValues')).toEqual([
      { path: '/rows/0/note', value: 'n1' },
    ]);
  });

  it('detaches an exiting field moved onto the path of an item perished at the prefixItems boundary', () => {
    const { root, at } = mount(
      {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            prefixItems: [gatedItem(FIRST_ON)],
            items: gatedItem(FIRST_ON),
          },
        },
      },
      {
        rows: [
          { on: true, note: 'n0' },
          { on: false, note: 'n1' },
          { on: true, note: 'n2' },
        ],
      },
    );
    const perished = at('/rows/1/note');
    const moved = at('/rows/2/note');
    const deliveries = pathDeliveries(moved);
    dispatchRemove(at('/rows'), 0);
    expect(root.emit).toEqual({ rows: [{ on: false }, { on: true }] });
    expect(perished.detached).toBe(true);
    expect(moved.detached).toBe(true);
    expect(moved.isActive).toBe(false);
    expect(moved.path).toBe('/rows/1/note');
    expect(registered(root, '/rows/1/note')).toBe(false);
    expect(deliveries).toEqual([]);
    expect(Reflect.get(root, 'inactiveValues')).toEqual([
      { path: '/rows/0/note', value: 'n1' },
      { path: '/rows/1/note', value: 'n2' },
    ]);
  });

  it('leaves a moved item without an exit live, with its path delivered', () => {
    const { root, at } = mount(
      {
        type: 'object',
        properties: { rows: { type: 'array', items: gatedItem(FIRST_ON) } },
      },
      {
        rows: [
          { on: true, note: 'n0' },
          { on: true, note: 'n1' },
        ],
      },
    );
    const moved = at('/rows/1/note');
    const deliveries = pathDeliveries(moved);
    dispatchRemove(at('/rows'), 0);
    expect(root.emit).toEqual({ rows: [{ on: true, note: 'n1' }] });
    expect(moved.detached).toBe(false);
    expect(moved.isActive).toBe(true);
    expect(find(root, '/rows/0/note')).toBe(moved);
    expect(registered(root, '/rows/0/note')).toBe(true);
    expect(deliveries).toEqual([
      { previous: '/rows/1/note', current: '/rows/0/note' },
    ]);
  });

  it('detaches a pending exit inside the perished item with that item, not as an exit', () => {
    const { root, at } = mount(
      {
        type: 'object',
        properties: {
          trim: {
            type: 'boolean',
            controls: {
              injectTo: (value: unknown) =>
                value === true ? { '/rows': [{ on: true, note: 'n0' }] } : {},
            },
          },
          rows: { type: 'array', items: gatedItem('../on === true') },
        },
      },
      {
        trim: false,
        rows: [
          { on: true, note: 'n0' },
          { on: true, note: 'n1' },
        ],
      },
    );
    const item = at('/rows/1');
    const note = at('/rows/1/note');
    const events: number[] = [];
    subscribeFieldNode(note, (event) => events.push(event.type));
    expect(registered(root, '/rows/1/note')).toBe(true);
    dispatchSetValue(
      root,
      {
        trim: true,
        rows: [
          { on: true, note: 'n0' },
          { on: false, note: 'n1' },
        ],
      },
      WriteOption.Overwrite,
    );
    expect(root.emit).toEqual({ trim: true, rows: [{ on: true, note: 'n0' }] });
    expect(item.detached).toBe(true);
    expect(item.isActive).toBe(false);
    expect(note.detached).toBe(true);
    expect(note.isActive).toBe(false);
    expect(registered(root, '/rows/1/note')).toBe(false);
    expect(events).toEqual([]);
    expect(Reflect.get(root, 'inactiveValues')).toEqual([]);
  });

  it('detaches every exiting field that insert moves up, as before', () => {
    const { root, at } = mount(
      {
        type: 'object',
        properties: { rows: { type: 'array', items: gatedItem(FIRST_ON) } },
      },
      {
        rows: [
          { on: true, note: 'n0' },
          { on: true, note: 'n1' },
        ],
      },
    );
    const first = at('/rows/0/note');
    const second = at('/rows/1/note');
    const deliveries = [pathDeliveries(first), pathDeliveries(second)];
    dispatchInsert(at('/rows'), 0, { on: false, note: 'x' });
    expect(root.emit).toEqual({
      rows: [{ on: false }, { on: true }, { on: true }],
    });
    expect([first.path, second.path]).toEqual(['/rows/1/note', '/rows/2/note']);
    expect([first.detached, second.detached]).toEqual([true, true]);
    expect([first.isActive, second.isActive]).toEqual([false, false]);
    expect(registered(root, '/rows/1/note')).toBe(false);
    expect(registered(root, '/rows/2/note')).toBe(false);
    expect(deliveries).toEqual([[], []]);
    expect(Reflect.get(root, 'inactiveValues')).toEqual([
      { path: '/rows/0/note', value: 'x' },
      { path: '/rows/1/note', value: 'n0' },
      { path: '/rows/2/note', value: 'n1' },
    ]);
  });

  it('detaches exits moved up by insert while a prefixItems item perishes in the same commit', () => {
    const { root, at } = mount(
      {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            prefixItems: [gatedItem(FIRST_ON)],
            items: gatedItem(FIRST_ON),
          },
        },
      },
      {
        rows: [
          { on: true, note: 'n0' },
          { on: true, note: 'n1' },
          { on: true, note: 'n2' },
        ],
      },
    );
    const notes = ['/rows/0/note', '/rows/1/note', '/rows/2/note'].map(at);
    const deliveries = notes.map(pathDeliveries);
    dispatchInsert(at('/rows'), 0, { on: false, note: 'x' });
    expect(root.emit).toEqual({
      rows: [{ on: false }, { on: true }, { on: true }, { on: true }],
    });
    expect(notes.map((note) => note.path)).toEqual([
      '/rows/0/note',
      '/rows/2/note',
      '/rows/3/note',
    ]);
    expect(notes.map((note) => note.detached)).toEqual([true, true, true]);
    expect(notes.map((note) => note.isActive)).toEqual([false, false, false]);
    expect(registered(root, '/rows/3/note')).toBe(false);
    expect(deliveries).toEqual([[], [], []]);
    expect(Reflect.get(root, 'inactiveValues')).toEqual([
      { path: '/rows/0/note', value: 'x' },
      { path: '/rows/1/note', value: 'n0' },
      { path: '/rows/2/note', value: 'n1' },
      { path: '/rows/3/note', value: 'n2' },
    ]);
  });

  it('detaches a nested exiting field when an outer remove moves its row onto the perished row path', () => {
    const { root, at } = mount(
      {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                on: { type: 'boolean' },
                cells: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      note: {
                        type: 'string',
                        controls: { active: '../../../../0/on === true' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        rows: [
          { on: true, cells: [{ note: 'a' }] },
          { on: false, cells: [{ note: 'b' }] },
        ],
      },
    );
    const cell = at('/rows/1/cells/0');
    const note = at('/rows/1/cells/0/note');
    const cellDeliveries = pathDeliveries(cell);
    const noteDeliveries = pathDeliveries(note);
    dispatchRemove(at('/rows'), 0);
    expect(root.emit).toEqual({ rows: [{ on: false, cells: [{}] }] });
    expect(note.detached).toBe(true);
    expect(note.isActive).toBe(false);
    expect(registered(root, '/rows/0/cells/0/note')).toBe(false);
    expect(noteDeliveries).toEqual([]);
    expect(Reflect.get(root, 'inactiveValues')).toEqual([
      { path: '/rows/0/cells/0/note', value: 'b' },
    ]);
    expect(cell.detached).toBe(false);
    expect(cellDeliveries).toEqual([
      { previous: '/rows/1/cells/0', current: '/rows/0/cells/0' },
    ]);
  });

  it('detaches an exiting field when an inner remove moves it onto the perished cell path', () => {
    const { root, at } = mount(
      {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                cells: { type: 'array', items: gatedItem(FIRST_ON) },
              },
            },
          },
        },
      },
      {
        rows: [
          {
            cells: [
              { on: true, note: 'a' },
              { on: false, note: 'b' },
            ],
          },
        ],
      },
    );
    const moved = at('/rows/0/cells/1/note');
    const deliveries = pathDeliveries(moved);
    dispatchRemove(at('/rows/0/cells'), 0);
    expect(root.emit).toEqual({ rows: [{ cells: [{ on: false }] }] });
    expect(moved.detached).toBe(true);
    expect(moved.isActive).toBe(false);
    expect(registered(root, '/rows/0/cells/0/note')).toBe(false);
    expect(deliveries).toEqual([]);
    expect(Reflect.get(root, 'inactiveValues')).toEqual([
      { path: '/rows/0/cells/0/note', value: 'b' },
    ]);
  });
});
