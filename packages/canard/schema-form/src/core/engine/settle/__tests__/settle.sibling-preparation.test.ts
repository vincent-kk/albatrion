import { afterEach, expect, it, vi } from 'vitest';

import { hasOwnProperty } from '@winglet/common-utils/lib';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import { getHostDerived } from '../../utils/cache/derivedRecords';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as reuser from '../utils/compute/childSelection/utils/createStaticEntryReuser';
import * as childLists from '../utils/structure/isSameChildList';
import { writeFieldNode } from '../utils/write/writeFieldNode';

const selectionMode = engineModes.gateSelection;
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('gateSelection', selectionMode);
});

// filid:contract settle-b9-sibling-preparation
it.each(['table', 'verify'] as const)('reuses static siblings and the unchanged child shape without full-list work (%s)', (mode) => {
  engineModes.setMode('gateSelection', mode);
  const { root } = createTestTree({
    type: 'object',
    properties: {
      type: { type: 'string', default: 'a' },
      ...Object.fromEntries(
        Array.from({ length: 1000 }, (_, index) => [
          `pad_${index}`,
          { type: 'number', default: index },
        ]),
      ),
    },
    oneOf: ['a', 'b'].map((value) => ({
      controls: { active: `./type === "${value}"` },
      properties: {
        x: { type: 'string', default: value },
        y: { type: 'string', default: value },
      },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.type, 'b', 'input', WriteOption.Overwrite);
  expect(
    getHostDerived(root.blueprintNode).directChildSelectionPlan,
  ).toBeNull();
  const structure = root.structure!;
  const children = root.children;
  const names = Object.keys(structure);
  const original = reuser.createStaticEntryReuser;
  let callbacks = 0;
  vi.spyOn(reuser, 'createStaticEntryReuser').mockImplementation((...args) => {
    const reuse = original(...args);
    return reuse
      ? (entry) => {
          callbacks++;
          return reuse(entry);
        }
      : undefined;
  });
  const comparisons = vi.spyOn(childLists, 'isSameChildList');
  const copies = vi.spyOn(Object, 'assign');
  const values = Object.values;
  let fullEnumerations = 0;
  vi.spyOn(Object, 'values').mockImplementation((object) => {
    if (object === root.structure) fullEnumerations++;
    return values(object);
  });
  writeFieldNode(root.structure!.type, 'a', 'input', WriteOption.Overwrite);
  const work = {
    callbacks,
    comparisons: comparisons.mock.calls.length,
    copies: copies.mock.calls.length,
    fullEnumerations,
  };
  vi.restoreAllMocks();
  expect(work).toEqual({
    callbacks: 0,
    comparisons: 0,
    copies: 0,
    fullEnumerations: 0,
  });
  expect(root.structure).toBe(structure);
  expect(root.children).toBe(children);
  expect(Object.keys(structure)).toEqual(names);
  expect(root.local).toMatchObject({ type: 'a', x: 'a', y: 'a', pad_999: 999 });
});

it('publishes ordinary shapes in numeric-key order with reserved static names', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: JSON.parse(
      '{"kind":{"type":"boolean","default":false},"2":{"type":"number","default":2},"__proto__":{"type":"string","default":"opaque"}}',
    ),
    oneOf: [
      {
        controls: { active: './kind === false' },
        properties: { '1': { type: 'number', default: 1 } },
      },
      {
        controls: { active: './kind === true' },
        properties: { '3': { type: 'number', default: 3 } },
      },
    ],
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  const structure = root.structure!;
  const names = Object.keys(structure);
  const children = [...root.children!];
  writeFieldNode(root.structure!.kind, false, 'input', WriteOption.Overwrite);
  expect(Object.keys(root.structure!)).toEqual(['1', '2', 'kind', '__proto__']);
  expect(root.children!.map((child) => child.name)).toEqual([
    '1',
    '2',
    'kind',
    '__proto__',
  ]);
  expect(hasOwnProperty(root.structure!, '__proto__')).toBe(true);
  expect(Object.getPrototypeOf(root.structure)).toBeNull();
  expect(Object.keys(structure)).toEqual(names);
  expect(children).not.toEqual(root.children);
});
