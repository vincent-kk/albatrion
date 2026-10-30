import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { dispatchMount, dispatchSetValue } from '../../write';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { readRetainedSlotRaw } from './fixtures/readRetainedSlotRaw';

it.each([
  { shared: true, label: 'W2 shared ancestor' },
  { shared: false, label: '[control] W2 unshared ancestor' },
] as const)(
  '$label supplies explicit retention to owned descendants',
  ({ shared }) => {
    const sibling: BlueprintSchema = shared
      ? {
          type: 'object',
          properties: {
            '0': { type: 'object', properties: { other: { type: 'number' } } },
          },
        }
      : { type: 'string' };
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        a: { type: 'boolean' },
        b: { type: 'boolean' },
        show: { type: 'boolean' },
      },
      allOf: [
        { controls: { active: './a' }, properties: { v: sibling } },
        {
          controls: { active: './b' },
          properties: {
            v: {
              type: 'array',
              controls: { unsetOnInactive: true },
              items: {
                type: 'object',
                controls: { active: '../../show', unsetOnInactive: false },
                properties: {
                  x: { type: 'number' },
                  extra: { type: 'string' },
                },
              },
            },
          },
        },
      ],
    });
    dispatchMount(root, {
      a: false,
      b: true,
      show: true,
      v: [{ x: 5, extra: 'kept', z: 9 }],
    });
    dispatchSetValue(getDispatchNode(root, 'show'), false);
    const value = readRetainedSlotRaw(root, '/v/0', 'object');
    expect(readRetainedSlotRaw(root, '/v/0/x', 'number')).toBe(5);
    dispatchSetValue(getDispatchNode(root, 'b'), false);
    expect(readRetainedSlotRaw(root, '/v/0/x', 'number')).toBe(5);
    expect(readRetainedSlotRaw(root, '/v/0/extra', 'string')).toBe('kept');
    if (shared) {
      expect(readRetainedSlotRaw(root, '/v/0', 'object')).toEqual(value);
    }
  },
);
