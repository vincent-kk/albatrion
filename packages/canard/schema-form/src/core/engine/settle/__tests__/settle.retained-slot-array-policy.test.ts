import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import { getDispatchNode } from './fixtures/getDispatchNode';

it.each([
  { inactive: false, candidateOwner: false },
  { inactive: true, candidateOwner: false },
  { inactive: false, candidateOwner: true },
  { inactive: true, candidateOwner: true },
])(
  'matches array clearing with inactive=$inactive and candidateOwner=$candidateOwner',
  ({ inactive, candidateOwner }) => {
    const run = (mode: 'off' | 'on') => {
      const { root, runtime } = createDispatchTree({
        type: 'object',
        ...(candidateOwner
          ? {
              allOf: [
                {
                  controls: { active: false },
                  properties: {
                    list: {
                      type: 'object',
                      properties: { other: { type: 'string' } },
                    },
                  },
                },
              ],
            }
          : undefined),
        properties: {
          open: { type: 'boolean' },
          show: { type: 'boolean' },
          list: {
            type: 'array',
            controls: { active: '#/open', unsetOnInactive: true },
            items: {
              type: 'object',
              properties: {
                drop: { type: 'number', controls: { active: '#/show' } },
                keep: {
                  type: 'number',
                  controls: { active: '#/show', unsetOnInactive: false },
                },
              },
            },
          },
        },
      });
      runtime.slots = mode;
      dispatchMount(root, {
        open: true,
        show: true,
        list: [{ drop: 11, keep: 12 }],
      });
      if (inactive) dispatchSetValue(getDispatchNode(root, 'show'), false);
      dispatchSetValue(getDispatchNode(root, 'open'), false);
      const closed = readFieldNodeInactiveValues(root);
      dispatchSetValue(getDispatchNode(root, 'open'), true);
      return {
        closed,
        reopened: root.emit,
        inactive: readFieldNodeInactiveValues(root),
      };
    };
    expect(run('on')).toEqual(run('off'));
  },
);
