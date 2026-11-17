import { expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../types/value';
import { dispatchMount, onInactiveFieldNode } from '../../write';
import { disposeFieldNodeTree } from '../utils/dispose/disposeFieldNodeTree';

it('does not resolve a descendant whose clearing ancestor exits in a later wheel', () => {
  const resolver = vi.fn(() => 'X');
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      open: { type: 'boolean', controls: { derived: '../flag' } },
      group: {
        type: 'object',
        controls: { active: '../open', unsetOnInactive: true },
        properties: {
          x: {
            type: 'string',
            controls: { active: '#/flag', inactiveValue: resolver },
          },
        },
      },
    },
  });
  root.setValue({ flag: true, open: true, group: { x: 'before' } });
  root.find('/flag')!.setValue(false);
  expect(root.find('/group')).toBeNull();
  expect(resolver).not.toHaveBeenCalled();
  expect(root.inactiveValues).toEqual([]);
  root.find('/flag')!.setValue(true);
  expect(root.find('/group/x')!.value).toBeUndefined();
});

it('does not call exit functions when the form is disposed', () => {
  const resolver = vi.fn(() => 'after');
  const listener = vi.fn(() => 'listener');
  const { root } = createDispatchTree({
    type: 'string',
    controls: { inactiveValue: resolver },
  });
  dispatchMount(root, 'before');
  onInactiveFieldNode(root, listener);
  disposeFieldNodeTree(root);
  expect(resolver).not.toHaveBeenCalled();
  expect(listener).not.toHaveBeenCalled();
});

it('retains a wrong-kind result and reports its misfit on re-entry', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: {
        type: 'string',
        controls: { active: '../open', inactiveValue: { invalid: true } },
      },
    },
  });
  root.setValue({ open: true, value: 'before' });
  root.find('/open')!.setValue(false);
  expect(root.inactiveValues).toEqual([
    { path: '/value', value: { invalid: true } },
  ]);
  root.find('/open')!.setValue(true);
  expect(root.find('/value')!.value).toEqual({ invalid: true });
  expect(root.find('/value')!.isMisfit).toBe(true);
});

it('preserves a declared array result and restores its length and values', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: {
        type: 'array',
        items: { type: 'string' },
        controls: {
          active: '../open',
          inactiveValue: ['after', 'second'],
        },
      },
    },
  });
  root.setValue({ open: true, value: ['before'] });
  root.find('/open')!.setValue(false);
  root.find('/open')!.setValue(true);
  expect(root.find('/value')!.value).toEqual(['after', 'second']);
  expect(root.find('/value')!.children).toHaveLength(2);
});

it('uses only the nearest declared layer when its resolver returns undefined', () => {
  const lessSpecific = vi.fn(() => 'fields');
  const { root } = makeFieldNodeTree({
    type: 'object',
    controls: {
      fields: [
        { targets: ['value'], controls: { inactiveValue: lessSpecific } },
      ],
    },
    properties: {
      open: { type: 'boolean' },
      value: {
        type: 'string',
        controls: { active: '../open', inactiveValue: () => undefined },
      },
    },
  });
  root.setValue({ open: true, value: 'before' });
  root.find('/open')!.setValue(false);
  expect(lessSpecific).not.toHaveBeenCalled();
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'before' }]);
});

it('does not resolve an already inactive descendant when its ancestor exits later', () => {
  const resolver = vi.fn(() => 'retained');
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      childOpen: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          value: {
            type: 'string',
            controls: { active: '#/childOpen', inactiveValue: resolver },
          },
        },
      },
    },
  });
  root.setValue({ open: true, childOpen: true, group: { value: 'before' } });
  root.find('/childOpen')!.setValue(false);
  root.find('/open')!.setValue(false);
  expect(resolver).toHaveBeenCalledTimes(1);
});

it('keeps an explicit keep descendant resolver under a clearing ancestor', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open', unsetOnInactive: true },
        properties: {
          value: {
            type: 'string',
            controls: { unsetOnInactive: false, inactiveValue: 'kept' },
          },
        },
      },
    },
  });
  root.setValue({ open: true, group: { value: 'before' } });
  root.find('/open')!.setValue(false);
  expect(root.inactiveValues).toEqual([
    { path: '/group/value', value: 'kept' },
  ]);
});

it('suppresses both resolver forms when automatic writes are disabled', () => {
  const resolver = vi.fn(() => 'declared');
  const listener = vi.fn(() => 'listener');
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: {
        type: 'string',
        controls: { active: '../open', inactiveValue: resolver },
      },
    },
  });
  root.setValue({ open: true, value: 'before' });
  root.find('/value')!.onInactive(listener);
  root.find('/open')!.setValue(false, WriteOption.DisableAutomaticWrites);
  expect(resolver).not.toHaveBeenCalled();
  expect(listener).not.toHaveBeenCalled();
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'before' }]);
});

it('does not resolve a value removed by reset within its load scope', () => {
  const resolver = vi.fn(() => 'declared');
  const listener = vi.fn(() => 'listener');
  const { root } = makeFieldNodeTree(
    {
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        value: {
          type: 'string',
          controls: { active: '../open', inactiveValue: resolver },
        },
      },
    },
    { snapshot: { open: false, value: 'loaded' } },
  );
  root.setValue({ open: true, value: 'before' });
  root.find('/value')!.onInactive(listener);
  root.resetSubtree();
  expect(resolver).not.toHaveBeenCalled();
  expect(listener).not.toHaveBeenCalled();
  expect(root.find('/value')).toBeNull();
});

it('retains an empty keep source when its resolver supplies the value at exit', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '../open', unsetOnInactive: true },
        items: {
          type: 'object',
          properties: {
            keep: {
              type: 'string',
              controls: { unsetOnInactive: false, inactiveValue: 'retained' },
            },
          },
        },
      },
    },
  });
  root.setValue({ open: true, list: [{}, { keep: 'before' }] });
  root.find('/open')!.setValue(false);
  root.find('/open')!.setValue(true);
  expect(root.find('/list')!.value).toEqual([
    { keep: 'retained' },
    { keep: 'retained' },
  ]);
});

it('writes keep descendant results to their compacted array position', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '../open', unsetOnInactive: true },
        items: {
          type: 'object',
          properties: {
            retain: { type: 'boolean' },
            keep: {
              type: 'string',
              controls: {
                active: '../retain',
                unsetOnInactive: false,
                inactiveValue: 'retained',
              },
            },
          },
        },
      },
    },
  });
  root.setValue({
    open: true,
    list: [{ retain: false }, { retain: true, keep: 'before' }],
  });
  root.find('/open')!.setValue(false);
  expect(root.inactiveValues).toContainEqual({
    path: '/list/0/keep',
    value: 'retained',
  });
  root.find('/open')!.setValue(true);
  expect(root.find('/list')!.value).toEqual([{}]);
});
