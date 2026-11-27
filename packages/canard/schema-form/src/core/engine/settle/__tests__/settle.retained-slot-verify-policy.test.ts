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
  'verifies array clearing with inactive=$inactive and candidateOwner=$candidateOwner',
  ({ inactive, candidateOwner }) => {
    const { root } = createDispatchTree({
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
    dispatchMount(root, {
      open: true,
      show: true,
      list: [{ drop: 11, keep: 12 }],
    });
    if (inactive) dispatchSetValue(getDispatchNode(root, 'show'), false);
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    const closed = readFieldNodeInactiveValues(root);
    expect(Object.isFrozen(closed)).toBe(true);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
  },
);

it.each([{ inactive: false }, { inactive: true }])(
  'verifies explicit object keep with inactive=$inactive',
  ({ inactive }) => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        show: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '#/open', unsetOnInactive: true },
          properties: {
            drop: { type: 'number', controls: { active: '#/show' } },
            keep: {
              type: 'number',
              controls: { active: '#/show', unsetOnInactive: false },
            },
          },
        },
      },
    });
    dispatchMount(root, {
      open: true,
      show: true,
      group: { drop: 11, keep: 12 },
    });
    if (inactive) dispatchSetValue(getDispatchNode(root, 'show'), false);
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    expect(readFieldNodeInactiveValues(root)).toContainEqual({
      path: '/group/keep',
      value: 12,
    });
    dispatchSetValue(getDispatchNode(root, 'open'), true);
  },
);
