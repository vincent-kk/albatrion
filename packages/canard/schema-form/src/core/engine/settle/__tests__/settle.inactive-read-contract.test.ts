import { afterEach, expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { createInactiveContractTree } from './fixtures/createInactiveContractTree';

afterEach(() => {
  vi.restoreAllMocks();
});

it('matches observed reads after many switches without intervening reads', () => {
  const deferred = createInactiveContractTree();
  const observed = createInactiveContractTree();
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
  const { root } = createInactiveContractTree(2);
  const held = root.inactiveValues[0];
  root.find('/kind')!.setValue('kind_1');
  root.find('/kind')!.setValue('kind_0');
  expect(root.inactiveValues[0]).toEqual(held);
  expect(root.inactiveValues[0]).not.toBe(held);
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

it('reuses untouched host reads without scanning map entries', () => {
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
