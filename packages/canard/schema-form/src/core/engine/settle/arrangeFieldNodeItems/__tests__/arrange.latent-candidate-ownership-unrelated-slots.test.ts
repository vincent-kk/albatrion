import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import { getItemEntries } from '../../../blueprint';
import type { BlueprintSchema } from '../../../blueprint';
import {
  dispatchInsert,
  dispatchMount,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';

it.each([{ position: 3 }, { position: 4 }])(
  'R2 unused candidate at $position preserves unrelated inactive sources',
  ({ position }) => {
    for (const unused of [false, true]) {
      const last: BlueprintSchema = unused
        ? {
            type: 'object',
            allOf: [
              {
                controls: { active: false },
                properties: { unused: { type: 'number' } },
              },
              {
                controls: { active: false },
                properties: { unused: { type: 'string' } },
              },
            ],
          }
        : item('number');
      const { root, runtime } = createDispatchTree({
        type: 'object',
        properties: {
          show: { type: 'boolean' },
          list: {
            type: 'array',
            prefixItems:
              position === 3
                ? [item('number'), item('string'), item('number'), last]
                : [
                    item('number'),
                    item('string'),
                    item('number'),
                    item('number'),
                    last,
                  ],
          },
        },
      });
      dispatchMount(root, { show: true, list: [{ v: 1 }, { v: '2' }] });
      dispatchSetValue(getDispatchNode(root, 'show'), false);
      const list = getDispatchNode(root, 'list');
      dispatchInsert(list, 0, { v: 0 });
      expect([...runtime.latentRaw]).toEqual([
        ['["/list/0/v","number"]', 0],
        ['["/list/1/v","string"]', '1'],
        ['["/list/2/v","number"]', 2],
      ]);
      expect([...(runtime.latentRawMetadata?.keys() ?? [])]).toEqual([
        '["/list/0/v","number"]',
        '["/list/1/v","string"]',
        '["/list/2/v","number"]',
      ]);
      for (const entry of [
        { index: 0, key: '["/list/0/v","number"]', path: '/list/0/v' },
        { index: 1, key: '["/list/1/v","string"]', path: '/list/1/v' },
        { index: 2, key: '["/list/2/v","number"]', path: '/list/2/v' },
      ]) {
        const blueprintNode = getItemEntries(
          list.blueprintNode,
          entry.index,
        )[0]?.node.childEntries.find((child) => child.name === 'v')?.node;
        if (!blueprintNode) throw new Error('Missing destination v template');
        const metadata = runtime.latentRawMetadata?.get(entry.key);
        expect(metadata).toEqual({
          path: entry.path,
          blueprintNode,
          order: [1, entry.index, 0],
        });
        expect(metadata?.blueprintNode).toBe(blueprintNode);
        expect(metadata?.exitLayers).toBeUndefined();
      }
      expect(readFieldNodeInactiveValues(root)).toEqual([
        { path: '/list/0/v', value: 0 },
        { path: '/list/1/v', value: '1' },
        { path: '/list/2/v', value: 2 },
      ]);
      expect(root.local).toEqual({ show: false, list: [{}, {}, {}] });
      expect(root.emit).toEqual(root.local);
    }
  },
);

/** Build one gated field with a single kind and explicit source retention. */
function item(type: 'number' | 'string'): BlueprintSchema {
  return {
    type: 'object',
    properties: {
      v: {
        type,
        controls: { active: '../../../show', unsetOnInactive: false },
      },
    },
  };
}
