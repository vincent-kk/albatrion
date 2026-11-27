import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import { getDispatchNode } from './fixtures/getDispatchNode';

it.each([
  ['on', false],
  ['off', false],
  ['verify', false],
  ['on', true],
  ['off', true],
  ['verify', true],
] as const)(
  '%s preserves aggregate-list lifetimes across host entry, own=%s',
  (_mode, own) => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../open' },
          properties: {
            ...(own ? { on: { type: 'boolean' as const } } : {}),
            held: { type: 'string', controls: { active: false } },
          },
        },
      },
    });
    dispatchMount(root, {
      open: true,
      group: { ...(own ? { on: false } : {}), held: 'saved' },
    });
    const group = getDispatchNode(root, 'group');
    const previous = readFieldNodeInactiveValues(group);
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    expect(readFieldNodeInactiveValues(group)).toBe(previous);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    const current = getDispatchNode(root, 'group');
    const next = readFieldNodeInactiveValues(current);
    expect(next).toEqual(previous);
    expect(current).not.toBe(group);
    expect(next === previous).toBe(!own);
    expect(readFieldNodeInactiveValues(group)).toBe(previous);
  },
);
