import { describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

/** Live tree root created by the shared settle fixture. */
type TestRoot = ReturnType<typeof createTestTree>['root'];

/**
 * Build a root whose `/list` fragment is gated by `/flag`.
 * @param list - Array keywords authored on the list itself
 * @param fragment - Item keywords and extra controls authored on the gated fragment
 * @returns Schema with one gated `allOf` fragment on the array host
 */
const gatedList = (
  list: Record<string, unknown>,
  fragment: Record<string, unknown> & { controls?: Record<string, unknown> },
): BlueprintSchema => ({
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    list: {
      type: 'array',
      ...list,
      allOf: [
        {
          ...fragment,
          controls: { active: '../flag', ...fragment.controls },
        },
      ],
    },
  },
});

/**
 * Read the three local state keys of a live array item.
 * @param root - Settled tree root
 * @param path - Item names under `/list`, outermost first
 * @returns `[readOnly, disabled, visible]` of the addressed item
 */
const stateKeys = (root: TestRoot, ...path: number[]) => {
  let node: TestRoot | undefined = root.structure!.list;
  for (const index of path) node = node?.structure?.[index];
  return [node?.readOnly, node?.disabled, node?.visible];
};

/**
 * Read the latent raw value kept for one exited string item.
 * @param root - Settled tree root
 * @param index - Item index under `/list`
 * @returns The kept raw value, or `undefined` when it was cleared
 */
const latentItem = (root: TestRoot, index: number) =>
  root.runtime.latentRaw.get(JSON.stringify(['/list/' + index, 'string']));

/**
 * Turn `/flag` off with an input write.
 * @param root - Settled tree root whose `/flag` gates the fragment
 */
const turnOff = (root: TestRoot) =>
  writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);

/** Fragment state keys that differ from every item's initial keys. */
const LOCKED = { readOnly: true, disabled: true, visible: false };

// filid:contract settle-item-fragment-layer
describe('array item fragment layer', () => {
  it('CONTROLS-077 items fragment state keys follow the fragment on and off', () => {
    const { root } = createTestTree(
      gatedList(
        { items: { type: 'string' } },
        { controls: LOCKED, items: { type: 'string' } },
      ),
    );
    loadFieldNodeAtMount(
      root,
      { flag: true, list: ['a', 'b'] },
      WriteOption.Overwrite,
    );
    expect([stateKeys(root, 0), stateKeys(root, 1)]).toEqual([
      [true, true, false],
      [true, true, false],
    ]);
    turnOff(root);
    expect([stateKeys(root, 0), stateKeys(root, 1)]).toEqual([
      [false, false, true],
      [false, false, true],
    ]);
  });

  it('CONTROLS-077 items fragment default fills every new item only while on', () => {
    const schema = gatedList(
      { items: { type: 'string' } },
      { controls: { default: 'd' }, items: { type: 'string' } },
    );
    const on = createTestTree(schema).root;
    loadFieldNodeAtMount(
      on,
      { flag: true, list: [undefined, undefined] },
      WriteOption.Overwrite,
    );
    const off = createTestTree(schema).root;
    loadFieldNodeAtMount(
      off,
      { flag: false, list: [undefined, undefined] },
      WriteOption.Overwrite,
    );
    expect(
      [on, off].map((root) =>
        [0, 1].map((index) => root.structure!.list!.structure![index]?.raw),
      ),
    ).toEqual([
      ['d', 'd'],
      [undefined, undefined],
    ]);
  });

  it('WRITE-032 items fragment unsetOnInactive clears its items when it turns off', () => {
    const { root } = createTestTree(
      gatedList(
        {},
        { controls: { unsetOnInactive: true }, items: { type: 'string' } },
      ),
    );
    root.runtime.unsetOnInactive = false;
    loadFieldNodeAtMount(
      root,
      { flag: true, list: ['a', 'b'] },
      WriteOption.Overwrite,
    );
    turnOff(root);
    expect([latentItem(root, 0), latentItem(root, 1)]).toEqual([
      undefined,
      undefined,
    ]);
  });

  it('WRITE-032 items fragment unsetOnInactive false keeps its items over the Form clear', () => {
    const { root } = createTestTree(
      gatedList(
        {},
        { controls: { unsetOnInactive: false }, items: { type: 'string' } },
      ),
    );
    root.runtime.unsetOnInactive = true;
    loadFieldNodeAtMount(
      root,
      { flag: true, list: ['a', 'b'] },
      WriteOption.Overwrite,
    );
    turnOff(root);
    expect([latentItem(root, 0), latentItem(root, 1)]).toEqual(['a', 'b']);
  });

  it('CONTROLS-077 additionalItems fragment reaches every tail item', () => {
    const tail = {
      items: [{ type: 'string' }],
      additionalItems: { type: 'string' },
    };
    const { root } = createTestTree(
      gatedList(tail, { ...tail, controls: LOCKED }),
    );
    loadFieldNodeAtMount(
      root,
      { flag: true, list: ['a', 'b', 'c'] },
      WriteOption.Overwrite,
    );
    expect([0, 1, 2].map((index) => stateKeys(root, index))).toEqual([
      [true, true, false],
      [true, true, false],
      [true, true, false],
    ]);
    turnOff(root);
    expect([1, 2].map((index) => stateKeys(root, index))).toEqual([
      [false, false, true],
      [false, false, true],
    ]);
  });

  it('CONTROLS-077 prefixItems and items of one fragment reach tuple and rest items alike', () => {
    const tuple = {
      prefixItems: [{ type: 'string' }],
      items: { type: 'string' },
    };
    const { root } = createTestTree(
      gatedList(tuple, { ...tuple, controls: { ...LOCKED, default: 'd' } }),
    );
    loadFieldNodeAtMount(
      root,
      { flag: true, list: [undefined, undefined] },
      WriteOption.Overwrite,
    );
    expect(
      [0, 1].map((index) => [
        root.structure!.list!.structure![index]?.raw,
        ...stateKeys(root, index),
      ]),
    ).toEqual([
      ['d', true, true, false],
      ['d', true, true, false],
    ]);
  });

  it('CONTROLS-077 nested array fragments reach only their own direct items', () => {
    const inner = { type: 'array', items: { type: 'string' } };
    const { root } = createTestTree({
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: {
            ...inner,
            allOf: [
              { controls: { disabled: true }, items: { type: 'string' } },
            ],
          },
          allOf: [{ controls: { readOnly: true }, items: inner }],
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { list: [['a', 'b'], ['c']] },
      WriteOption.Overwrite,
    );
    expect([
      stateKeys(root, 0),
      stateKeys(root, 1),
      stateKeys(root, 0, 0),
      stateKeys(root, 0, 1),
      stateKeys(root, 1, 0),
    ]).toEqual([
      [true, false, true],
      [true, false, true],
      [false, true, true],
      [false, true, true],
      [false, true, true],
    ]);
  });
});
