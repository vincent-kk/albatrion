import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import * as policy from '../utils/slots/readSlotExitPolicy';
import { getDispatchNode } from './fixtures/getDispatchNode';

it('compacts live kept descendants in their original order', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '#/open', unsetOnInactive: true },
        items: {
          type: 'object',
          properties: {
            drop: { type: 'number' },
            keep: { type: 'number', controls: { unsetOnInactive: false } },
          },
        },
      },
    },
  });
  dispatchMount(root, {
    open: true,
    list: [{ drop: 1 }, { drop: 2, keep: 12 }, { drop: 3 }, { keep: 24 }],
  });
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(readFieldNodeInactiveValues(root)).toEqual([
    { path: '/list/0/keep', value: 12 },
    { path: '/list/1/keep', value: 24 },
  ]);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(root.emit).toEqual({ open: true, list: [{ keep: 12 }, { keep: 24 }] });
  expect(getDispatchNode(root, 'list').itemCount).toBe(2);
});

it('restores scalar items that explicitly keep their own source', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '#/open', unsetOnInactive: true },
        items: { type: 'string', controls: { unsetOnInactive: false } },
      },
    },
  });
  dispatchMount(root, { open: true, list: ['first', undefined, 'last'] });
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(readFieldNodeInactiveValues(root)).toEqual([
    { path: '/list/0', value: 'first' },
    { path: '/list/1', value: 'last' },
  ]);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(root.emit).toEqual({ open: true, list: ['first', 'last'] });
});

it('recursively compacts nested clearing arrays', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '#/open', unsetOnInactive: true },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              drop: { type: 'number' },
              keep: { type: 'number', controls: { unsetOnInactive: false } },
            },
          },
        },
      },
    },
  });
  dispatchMount(root, {
    open: true,
    list: [[{ drop: 1 }], [{ drop: 2 }, { keep: 12 }], [{ keep: 24 }]],
  });
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(readFieldNodeInactiveValues(root)).toEqual([
    { path: '/list/0/0/keep', value: 12 },
    { path: '/list/1/0/keep', value: 24 },
  ]);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(root.emit).toEqual({
    open: true,
    list: [[{ keep: 12 }], [{ keep: 24 }]],
  });
});

it('keeps clearing arrays without keep descendants empty on re-entry', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '#/open', unsetOnInactive: true },
        items: { type: 'number' },
      },
    },
  });
  dispatchMount(root, { open: true, list: [1, 2] });
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(readFieldNodeInactiveValues(root)).toEqual([]);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'list').itemCount).toBe(0);
  expect(root.emit).toEqual({ open: true });
});

it.each([
  { kind: 'object' as const, clear: true, visits: 3 },
  { kind: 'array' as const, clear: false, visits: 7 },
])(
  'preserves overlay visits for $kind exits with clear=$clear',
  ({ kind, clear, visits }) => {
    const properties = {
      drop: { type: 'number' as const },
      keep: { type: 'number' as const, controls: { unsetOnInactive: false } },
    };
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: kind,
          controls: { active: '#/open', unsetOnInactive: clear },
          ...(kind === 'array'
            ? { items: { type: 'object', properties } }
            : { properties }),
        },
      },
    });
    dispatchMount(root, {
      open: true,
      list:
        kind === 'array'
          ? [
              { drop: 1, keep: 12 },
              { drop: 2, keep: 24 },
            ]
          : { drop: 1, keep: 12 },
    });
    const spy = vi.spyOn(policy, 'readSlotExitPolicy');
    try {
      dispatchSetValue(getDispatchNode(root, 'open'), false);
      expect(spy).toHaveBeenCalledTimes(visits);
    } finally {
      spy.mockRestore();
    }
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(root.emit).toEqual({
      open: true,
      list:
        kind === 'array'
          ? [
              { drop: 1, keep: 12 },
              { drop: 2, keep: 24 },
            ]
          : { keep: 12 },
    });
  },
);
