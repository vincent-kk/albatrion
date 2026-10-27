import { expect, it } from 'vitest';

import { dispatchMount, dispatchSetValue } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import { createSlotVerifyPair } from './fixtures/createSlotVerifyPair';
import { getDispatchNode } from './fixtures/getDispatchNode';

it.each([
  { inactive: false, candidateOwner: false },
  { inactive: true, candidateOwner: false },
  { inactive: false, candidateOwner: true },
  { inactive: true, candidateOwner: true },
])(
  'verifies array clearing with inactive=$inactive and candidateOwner=$candidateOwner',
  ({ inactive, candidateOwner }) => {
    const { root } = createSlotVerifyPair(
      {
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
      },
      'verify',
    );
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
    expect(root.runtime.slotVerification?.commits).toBe(inactive ? 4 : 3);
    expect(root.runtime.slotVerification?.differences).toBe(0);
  },
);

it.each([{ inactive: false }, { inactive: true }])(
  'verifies explicit object keep with inactive=$inactive',
  ({ inactive }) => {
    const { root } = createSlotVerifyPair(
      {
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
      },
      'verify',
    );
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
    expect(root.runtime.slotVerification?.differences).toBe(0);
  },
);
