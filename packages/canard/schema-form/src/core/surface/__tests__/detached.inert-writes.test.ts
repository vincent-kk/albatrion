import { afterEach, expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { FormWarningCode } from '@/schema-form/errors';

import { isArrayNode } from '../utils/guards';

afterEach(() => vi.restoreAllMocks());

it.each(['push', 'insert', 'pop', 'remove', 'update', 'clear'] as const)(
  'warns exactly once and preserves every value for detached array %s',
  (verb) => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: 'array',
          items: { type: 'string' },
          controls: { active: '../open' },
        },
      },
    });
    root.setValue({ open: true, list: ['a'] });
    const old = root.find('/list');
    if (!old || !isArrayNode(old)) throw new Error('Expected array');
    root.find('/open')!.setValue(false);
    const inactive = root.inactiveValues;
    const warning = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const operations = {
      push: () => old.push('z'),
      insert: () => old.insert(0, 'z'),
      pop: () => old.pop(),
      remove: () => old.remove(0),
      update: () => old.update(0, 'z'),
      clear: () => old.clear(),
    };
    operations[verb]();
    expect(warning).toHaveBeenCalledExactlyOnceWith(
      FormWarningCode.DetachedNodeWrite,
      expect.any(String),
      { path: '/list' },
    );
    expect(old.value).toEqual(['a']);
    expect(root.inactiveValues).toBe(inactive);
    root.find('/open')!.setValue(true);
    expect(root.find('/list')!.value).toEqual(['a']);
  },
);

it('keeps a live batch write when an old detached host is reset', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: { x: { type: 'string' } },
      },
    },
  });
  root.setValue({ open: true, group: { x: 'a' } });
  const old = root.find('/group')!;
  root.find('/open')!.setValue(false);
  root.find('/open')!.setValue(true);
  const targets = Reflect.get(root, 'runtime').validationTargets;
  root.batch(() => {
    root.find('/group/x')!.setValue('b');
    old.resetSubtree();
    expect(Reflect.get(root, 'runtime').validationTargets).toBe(targets);
  });
  expect(root.find('/group/x')!.value).toBe('b');
});

// filid:contract surface-detached
it('leaves frozen reads, overlay, and inactive publication unchanged through detached writes', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      leaf: { type: 'string', controls: { active: '../open' } },
    },
  });
  root.setValue({ open: true, leaf: 'held' });
  const old = root.find('/leaf')!;
  root.find('/open')!.setValue(false);
  const publication = root.inactiveValues;
  const overlay = Reflect.get(root, 'inactiveSlotOverlays');
  const updater = vi.fn(() => 'ignored');
  old.setValue(updater);
  expect(updater).not.toHaveBeenCalled();
  expect(old.value).toBe('held');
  expect(Reflect.get(root, 'inactiveSlotOverlays')).toBe(overlay);
  expect(root.inactiveValues).toBe(publication);
  root.find('/open')!.setValue(true);
  expect(root.find('/leaf')!.value).toBe('held');
  old.setValue('ignored again');
  expect(root.find('/leaf')!.value).toBe('held');
  expect(root.find('/leaf')).not.toBe(old);
});

it('ignores every array verb while detached and in a batch after re-entry', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      list: {
        type: 'array',
        items: { type: 'string' },
        controls: { active: '../open' },
      },
    },
  });
  root.setValue({ open: true, list: ['a', 'b'] });
  const old = root.find('/list');
  if (!old || !isArrayNode(old)) throw new Error('Expected array');
  root.find('/open')!.setValue(false);
  const verbs = () => {
    expect(old.push('z')).toBe(2);
    expect(old.insert(0, 'z')).toBe(2);
    expect(old.pop()).toBeUndefined();
    expect(old.remove(0)).toBeUndefined();
    expect(old.update(0, 'z')).toBeUndefined();
    expect(old.clear()).toBeUndefined();
  };
  verbs();
  root.find('/open')!.setValue(true);
  expect(root.find('/list')!.value).toEqual(['a', 'b']);
  root.batch(verbs);
  expect(root.find('/list')!.value).toEqual(['a', 'b']);
  expect(old.value).toEqual(['a', 'b']);
});

it('warns in development when a detached reference receives a write', () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      leaf: { type: 'string', controls: { active: '../open' } },
    },
  });
  root.setValue({ open: true, leaf: 'held' });
  const old = root.find('/leaf')!;
  root.find('/open')!.setValue(false);
  old.setValue('ignored');
  expect(warning).toHaveBeenCalledWith(
    expect.stringContaining('DETACHED_NODE_WRITE'),
    expect.any(String),
    expect.objectContaining({ path: '/leaf' }),
  );
});

it('returns null for both an inactive declaration and an undeclared path', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: { leaf: { type: 'string', controls: { active: 'false' } } },
  });
  expect(root.find('/leaf')).toBeNull();
  expect(root.find('/unknown')).toBeNull();
});
