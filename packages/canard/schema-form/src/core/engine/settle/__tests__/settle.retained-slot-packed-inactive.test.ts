import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import { getDispatchNode } from './fixtures/getDispatchNode';

it.each(['off', 'on', 'verify'] as const)(
  '%s keeps prior absent-item inputs inside the exiting packed array source',
  () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        a: {
          type: 'array',
          controls: { active: '#/flag' },
          items: {
            type: 'object',
            controls: { active: './on === true' },
            properties: { on: { type: 'boolean' }, v: { type: 'string' } },
          },
        },
      },
    });
    const a = [
      { on: false, v: 'first' },
      { on: false, v: 'second' },
    ];
    dispatchMount(root, { flag: true, a });
    dispatchSetValue(getDispatchNode(root, 'flag'), false);
    expect(readFieldNodeInactiveValues(root)).toEqual([
      { path: '/a', value: a },
    ]);
    dispatchSetValue(getDispatchNode(root, 'flag'), true);
    expect(root.local).toEqual({ flag: true, a: [{}, {}] });
  },
);
