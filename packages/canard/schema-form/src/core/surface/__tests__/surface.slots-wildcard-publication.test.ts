import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

it('publishes an inactive literal star field through the ordinary slot rule', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      '*': { type: 'string', controls: { active: '../open' } },
    },
  });
  root.setValue({ open: true, '*': 'retained' });
  const empty = root.inactiveValues;
  root.find('/open')!.setValue(false);
  expect(root.inactiveValues).toEqual([{ path: '/%2A', value: 'retained' }]);
  expect(root.inactiveValues).not.toBe(empty);
});

it('preserves an unread publication when a fresh external wildcard match enters', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      xOpen: { type: 'boolean' },
      otherOpen: { type: 'boolean' },
      '*': {
        type: 'object',
        properties: {
          x: { type: 'string', controls: { active: '../../xOpen' } },
        },
      },
      other: {
        type: 'object',
        controls: { active: '../otherOpen' },
        properties: { x: { type: 'string', default: 'new match' } },
      },
    },
  });
  root.setValue({ xOpen: false, otherOpen: false, '*': { x: 'held' } });
  root.find('/otherOpen')!.setValue(true);
  const star = root.children!.find((node) => node.name === '*')!;
  expect(star.inactiveValues).toEqual([{ path: '/%2A/x', value: 'held' }]);
});

it('keeps an unread detached host query result when its live wildcard match later leaves', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      starOpen: { type: 'boolean' },
      xOpen: { type: 'boolean' },
      otherOpen: { type: 'boolean' },
      '*': {
        type: 'object',
        controls: { active: '../starOpen' },
        properties: {
          x: { type: 'string', controls: { active: '../../xOpen' } },
        },
      },
      other: {
        type: 'object',
        controls: { active: '../otherOpen' },
        properties: { x: { type: 'string' } },
      },
    },
  });
  root.setValue({
    starOpen: true,
    xOpen: true,
    otherOpen: true,
    '*': { x: 'held' },
    other: { x: 'live match' },
  });
  const held = root.children!.find((node) => node.name === '*')!;
  root.find('/xOpen')!.setValue(false);
  root.find('/starOpen')!.setValue(false);
  root.find('/otherOpen')!.setValue(false);
  expect(held.inactiveValues).toEqual([{ path: '/%2A/x', value: 'held' }]);
  expect(held.inactiveValues).toBe(held.inactiveValues);
});
