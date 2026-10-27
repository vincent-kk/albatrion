import { afterEach, expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { engineModes } from '../../utils/cache/engineModes';
import { createInactiveLazyTree } from './fixtures/createInactiveLazyTree';

const previousMode = engineModes.inactiveValues;
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('inactiveValues', previousMode);
});

it('matches eager reads after many switches without intervening reads', () => {
  const deferred = createInactiveLazyTree();
  const observed = createInactiveLazyTree();
  const held = deferred.root.inactiveValues;
  for (const kind of [1, 6, 0, 7, 2, 4, 0]) {
    deferred.root.find('/kind')!.setValue(`kind_${kind}`);
    observed.root.find('/kind')!.setValue(`kind_${kind}`);
    expect(Object.isFrozen(observed.root.inactiveValues)).toBe(true);
  }
  expect(deferred.root.inactiveValues).toEqual(observed.root.inactiveValues);
  expect(deferred.root.inactiveValues).not.toBe(held);
  expect(deferred.root.inactiveValues).toBe(deferred.root.inactiveValues);
  expect(deferred.root.inactiveValues.every(Object.isFrozen)).toBe(true);
});

it('does not revive an old item identity after its path entered and exited unread', () => {
  const { root } = createInactiveLazyTree(2);
  const held = root.inactiveValues[0];
  root.find('/kind')!.setValue('kind_1');
  root.find('/kind')!.setValue('kind_0');
  expect(root.inactiveValues[0]).toEqual(held);
  expect(root.inactiveValues[0]).not.toBe(held);
});

it('captures an unread departing host by generation without reading its array', () => {
  engineModes.setMode('inactiveValues', 'lazy');
  const { root, runtime } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          on: { type: 'boolean' },
          held: { type: 'string', controls: { active: '../on' } },
        },
      },
    },
  });
  root.setValue({ open: true, group: { on: true, held: 'old' } });
  root.find('/group/on')!.setValue(false);
  const group = root.find('/group')!;
  const memo = Reflect.get(runtime, 'inactiveValuesMemo');
  const get = vi.spyOn(memo, 'get');
  root.find('/open')!.setValue(false);
  const reads = get.mock.calls.filter(([path]) => path === '/group');
  get.mockRestore();
  expect(reads).toHaveLength(0);
  root.setValue({ open: false, group: { on: false, held: 'new' } });
  expect(group.inactiveValues).toEqual([{ path: '/group/held', value: 'old' }]);
  expect(group.inactiveValues).toBe(group.inactiveValues);
  expect(Object.isFrozen(group.inactiveValues)).toBe(true);
});

it('retains a materialized departing generation and untouched host identities', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: { held: { type: 'string', controls: { active: false } } },
      },
      quiet: {
        type: 'object',
        properties: { held: { type: 'number', controls: { active: false } } },
      },
    },
  });
  root.setValue({ open: true, group: { held: 'saved' }, quiet: { held: 7 } });
  const group = root.find('/group')!;
  const held = group.inactiveValues;
  const quiet = root.find('/quiet')!;
  const untouched = quiet.inactiveValues;
  root.find('/open')!.setValue(false);
  expect(group.inactiveValues).toBe(held);
  expect(quiet.inactiveValues).toBe(untouched);
  root.find('/open')!.setValue(true);
  expect(root.find('/group')).not.toBe(group);
  expect(group.inactiveValues).toBe(held);
  expect(root.find('/group')!.inactiveValues).toEqual(held);
});

it('bounds unread journals by compression while preserving older detached tokens', () => {
  engineModes.setMode('inactiveValues', 'lazy');
  const { root, runtime } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      kind: { type: 'string' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: { held: { type: 'string', controls: { active: false } } },
      },
    },
    oneOf: [0, 1].map((index) => ({
      controls: { active: `./kind === "${index}"` },
      properties: { [`value_${index}`]: { type: 'string' } },
    })),
  });
  root.setValue({
    open: true,
    kind: '0',
    group: { held: 'old' },
    value_0: 'a',
    value_1: 'b',
  });
  const group = root.find('/group')!;
  root.find('/open')!.setValue(false);
  for (let index = 0; index < 180; index++)
    root.find('/kind')!.setValue(String(index % 2));
  const state: unknown = Reflect.get(runtime, 'inactiveValuesState');
  expect(state).toBeTypeOf('object');
  if (!state || typeof state !== 'object')
    throw new Error('Missing lazy state');
  expect(Reflect.get(state, 'compactions')).toBeGreaterThan(0);
  expect(Reflect.get(state, 'journalSize')).toBeLessThanOrEqual(512);
  expect(group.inactiveValues).toEqual([{ path: '/group/held', value: 'old' }]);
  expect(group.inactiveValues).toBe(group.inactiveValues);
});

it('does not revisit journal facts on repeated reads of an untouched host', () => {
  engineModes.setMode('inactiveValues', 'lazy');
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      kind: { type: 'string' },
      quiet: {
        type: 'object',
        properties: { held: { type: 'string', controls: { active: false } } },
      },
    },
    oneOf: [0, 1].map((index) => ({
      controls: { active: `./kind === "${index}"` },
      properties: { [`value_${index}`]: { type: 'string' } },
    })),
  });
  root.setValue({
    kind: '0',
    quiet: { held: 'saved' },
    value_0: 'a',
    value_1: 'b',
  });
  void root.inactiveValues;
  const quiet = root.find('/quiet')!;
  const held = quiet.inactiveValues;
  root.find('/kind')!.setValue('1');
  expect(quiet.inactiveValues).toBe(held);
  const values = vi.spyOn(Map.prototype, 'values');
  const keys = vi.spyOn(Map.prototype, 'keys');
  const first = quiet.inactiveValues;
  const second = quiet.inactiveValues;
  const visits = values.mock.calls.length + keys.mock.calls.length;
  vi.restoreAllMocks();
  expect(first).toBe(held);
  expect(second).toBe(held);
  expect(visits).toBe(0);
});
