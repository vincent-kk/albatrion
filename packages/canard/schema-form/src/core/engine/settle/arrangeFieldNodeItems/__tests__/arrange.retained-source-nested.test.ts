import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';

it.each([
  ['on', 'insert'],
  ['off', 'insert'],
  ['verify', 'insert'],
  ['on', 'remove'],
  ['off', 'remove'],
  ['verify', 'remove'],
] as const)('%s preserves nested array candidates on %s', (mode, operation) => {
  const normal = nestedArray(false);
  const reversed = nestedArray(true);
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      kind: { type: 'string' },
      list: {
        type: 'array',
        prefixItems:
          operation === 'insert'
            ? [normal, reversed, reversed]
            : [reversed, normal, reversed],
      },
    },
  });
  runtime.slots = mode;
  dispatchMount(root, {
    kind: 'string',
    list: operation === 'insert' ? [[{ v: 'live' }]] : [[], [{ v: 'live' }]],
  });
  const list = getDispatchNode(root, 'list');
  const source = operation === 'insert' ? 0 : 1;
  const destination = operation === 'insert' ? 1 : 0;
  const old = getDispatchNode(list, String(source));
  dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
  expect(getDispatchNode(old, '0', 'v').local).toBe(37);
  dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
  runtime.disableAutomaticWrites = true;
  if (operation === 'insert') dispatchInsert(list, 0, []);
  else dispatchRemove(list, 0);
  expect(old.detached).toBe(true);
  expect(getDispatchNode(list, String(destination), '0', 'v').local).toBe(37);
  dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
  expect(getDispatchNode(list, String(destination), '0', 'v').local).toBe(
    'live',
  );
  dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
  expect(getDispatchNode(list, String(destination), '0', 'v').local).toBe(37);
});

/**
 * Declare opposite leaf gates below one immediate array item template.
 * @param reversed - Whether the destination selects the opposite candidate
 * @returns Nested array whose root source must survive tuple recreation
 */
const nestedArray = (reversed: boolean): BlueprintSchema => ({
  type: 'array',
  items: {
    type: 'object',
    allOf: [
      {
        controls: {
          active: `../../../kind === "${reversed ? 'number' : 'string'}"`,
        },
        properties: { v: { type: 'string' } },
      },
      {
        controls: {
          active: `../../../kind === "${reversed ? 'string' : 'number'}"`,
        },
        properties: { v: { type: 'number', default: 37 } },
      },
    ],
  },
});
