import { afterEach, beforeEach, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { engineModes } from '../../utils/cache/engineModes';
import { inactiveValuesVerification } from '../utils/commit/verifyInactiveValuesMemo';

const previousMode = engineModes.inactiveValues;
beforeEach(() => engineModes.setMode('inactiveValues', 'verify'));
afterEach(() => engineModes.setMode('inactiveValues', previousMode));

it('checks nested hosts, descendant visibility and repeated re-entry against the full oracle', () => {
  const before = inactiveValuesVerification.comparisons;
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      show: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../show' },
        properties: {
          on: { type: 'boolean' },
          value: { type: 'string', controls: { active: '../on' } },
          nested: {
            type: 'object',
            properties: {
              hidden: { type: 'number', controls: { active: false } },
            },
          },
        },
      },
    },
  });
  root.setValue({
    show: true,
    group: { on: true, value: 'held', nested: { hidden: 7 } },
  });
  const group = root.find('/group')!;
  root.find('/group/on')!.setValue(false);
  expect(root.inactiveValues).toEqual([
    { path: '/group/value', value: 'held' },
    { path: '/group/nested/hidden', value: 7 },
  ]);
  for (const show of [false, true, false, true])
    root.find('/show')!.setValue(show);
  expect(root.find('/group')).not.toBe(group);
  expect(root.find('/group')!.inactiveValues).toEqual([
    { path: '/group/value', value: 'held' },
    { path: '/group/nested/hidden', value: 7 },
  ]);
  expect(inactiveValuesVerification.comparisons).toBeGreaterThan(before);
});

it('checks array item exits, reordered latent paths and wholesale pruning', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      show: { type: 'boolean' },
      list: {
        type: 'array',
        items: { type: 'string', controls: { active: '#/show' } },
      },
    },
  });
  root.setValue({ show: true, list: ['a', 'b', 'c'] });
  root.find('/show')!.setValue(false);
  expect(root.inactiveValues).toEqual([
    { path: '/list/0', value: 'a' },
    { path: '/list/1', value: 'b' },
    { path: '/list/2', value: 'c' },
  ]);
  const list = root.find('/list')!;
  if (list.type !== 'array') throw new Error('Expected array host');
  list.remove(0);
  expect(root.inactiveValues).toEqual([
    { path: '/list/0', value: 'b' },
    { path: '/list/1', value: 'c' },
  ]);
  list.clear();
  expect(root.inactiveValues).toEqual([]);
});

it('checks same-name different-kind candidates and unsetOnInactive exits', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: { kind: { type: 'string' } },
    oneOf: [
      {
        controls: { active: './kind === "s"' },
        properties: { value: { type: 'string' } },
      },
      {
        controls: { active: './kind === "n"' },
        properties: {
          value: { type: 'number', controls: { unsetOnInactive: true } },
          cleared: { type: 'number', controls: { unsetOnInactive: true } },
        },
      },
    ],
  });
  root.setValue({ kind: 's', value: 'kept' });
  root.find('/kind')!.setValue('n');
  root.find('/cleared')!.setValue(42);
  root.find('/kind')!.setValue('neither');
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'kept' }]);
  root.find('/kind')!.setValue('s');
  expect(root.find('/value')!.value).toBe('kept');
  expect(root.inactiveValues).toEqual([]);
});

it('checks load, reset and a rebuilt tree without retaining earlier publication state', () => {
  const schema = {
    type: 'object' as const,
    properties: {
      show: { type: 'boolean' as const },
      value: {
        type: 'string' as const,
        controls: { active: '../show' },
      },
    },
  };
  const { root } = makeFieldNodeTree(schema, {
    snapshot: { show: false, value: 'loaded' },
  });
  root.resetSubtree();
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'loaded' }]);
  root.find('/show')!.setValue(true);
  root.find('/value')!.setValue('edited');
  root.resetSubtree();
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'loaded' }]);
  const rebuilt = makeFieldNodeTree(schema, {
    snapshot: { show: false, value: 'rebuilt' },
  }).root;
  rebuilt.resetSubtree();
  expect(rebuilt.inactiveValues).toEqual([
    { path: '/value', value: 'rebuilt' },
  ]);
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'loaded' }]);
});
