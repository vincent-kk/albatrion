import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import { getDispatchNode } from './fixtures/getDispatchNode';

it.each([
  ['on', true],
  ['off', true],
  ['verify', true],
  ['on', false],
  ['off', false],
  ['verify', false],
] as const)(
  '%s preserves candidate arrays through host exits, absent=%s',
  (mode, absent) => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        a: { type: 'boolean' },
        b: { type: 'boolean' },
        list: {
          type: 'array',
          controls: { active: '../open' },
          allOf: [
            { controls: { active: '../a' }, items: { type: 'string' } },
            { controls: { active: '../b' }, items: { type: 'number' } },
          ],
        },
      },
    });
    runtime.slots = mode;
    dispatchMount(root, { open: true, a: true, b: false, list: ['A'] });
    if (absent) dispatchSetValue(getDispatchNode(root, 'a'), false);
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    const first = readFieldNodeInactiveValues(root);
    expect(first).toEqual([
      { path: '/list', value: ['A'] },
      { path: '/list/0', value: 'A' },
    ]);
    if (!absent) dispatchSetValue(getDispatchNode(root, 'a'), false);
    dispatchSetValue(getDispatchNode(root, 'b'), true);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(getDispatchNode(root, 'list').local).toEqual([null]);
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    const second = readFieldNodeInactiveValues(root);
    expect(second).toEqual([
      { path: '/list', value: [undefined] },
      { path: '/list/0', value: 'A' },
    ]);
    expect(second[1]).not.toBe(first[1]);
    dispatchSetValue(getDispatchNode(root, 'b'), false);
    dispatchSetValue(getDispatchNode(root, 'a'), true);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(getDispatchNode(root, 'list').local).toEqual(['A']);
  },
);
