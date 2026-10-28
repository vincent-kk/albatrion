import { afterEach, expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import type { InactiveValueContext } from '../../types/controls';

afterEach(() => vi.restoreAllMocks());

it.each(['literal ../open', false, 0, null, { saved: true }])(
  'publishes literal %j and restores it into a new lifetime',
  (inactiveValue) => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        value: {
          type: ['string', 'number', 'boolean', 'object', 'null'],
          options: { terminal: true },
          controls: { active: '../open', inactiveValue },
        },
      },
    });
    root.setValue({ open: true, value: 'before' });
    const old = root.find('/value')!;
    root.find('/open')!.setValue(false);
    expect(root.inactiveValues).toEqual([
      { path: '/value', value: inactiveValue },
    ]);
    expect(root.inactiveValues).toBe(root.inactiveValues);
    expect(old.value).toBe('before');
    root.find('/open')!.setValue(true);
    expect(root.find('/value')).not.toBe(old);
    expect(root.find('/value')!.value).toEqual(inactiveValue);
  },
);

it('resolves a function from the preceding committed value and full context', () => {
  const resolver = vi.fn((value: unknown, context: InactiveValueContext) => {
    expect(value).toBe('before');
    expect(context.dataPath).toBe('/group/value');
    expect(context.schemaPath).toBe('#/properties/group/properties/value');
    expect(context.parentValue).toEqual({ value: 'before' });
    expect(context.rootValue).toEqual({
      open: true,
      group: { value: 'before' },
    });
    expect(context.jsonSchema).toMatchObject({ type: 'string' });
    expect(context.parentJSONSchema).toMatchObject({ type: 'object' });
    expect(context.rootJSONSchema).toMatchObject({ type: 'object' });
    expect(context.context).toEqual({});
    return 'after';
  });
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          value: { type: 'string', controls: { inactiveValue: resolver } },
        },
      },
    },
  });
  root.setValue({ open: true, group: { value: 'before' } });
  root.setValue({ open: false, group: { value: 'written during exit' } });
  expect(resolver).toHaveBeenCalledTimes(1);
  expect(root.inactiveValues).toEqual([
    { path: '/group/value', value: 'after' },
  ]);
  root.find('/open')!.setValue(true);
  expect(root.find('/group/value')!.value).toBe('after');
});

it('preserves the retained source when the resolver returns undefined', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
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
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'before' }]);
});

it.each(['node', 'fields', 'fragment'])(
  'uses the nearest authored %s layer',
  (layer) => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: { open: { type: 'boolean' } },
      controls:
        layer !== 'fragment'
          ? {
              fields: [
                { targets: ['value'], controls: { inactiveValue: 'fields' } },
              ],
            }
          : undefined,
      allOf: [
        {
          controls: { inactiveValue: 'fragment' },
          properties: {
            value: {
              type: 'string',
              controls: {
                active: '../open',
                ...(layer === 'node' ? { inactiveValue: 'node' } : {}),
              },
            },
          },
        },
      ],
    });
    root.setValue({ open: true, value: 'before' });
    root.find('/open')!.setValue(false);
    expect(root.inactiveValues).toEqual([{ path: '/value', value: layer }]);
  },
);

it('applies descendant results after ancestor JSON, retaining undeclared extras', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: {
          active: '../open',
          inactiveValue: { value: 'ancestor', extra: 42 },
        },
        properties: {
          value: { type: 'string', controls: { inactiveValue: 'descendant' } },
        },
      },
    },
  });
  root.setValue({ open: true, group: { value: 'before' } });
  root.find('/open')!.setValue(false);
  root.find('/open')!.setValue(true);
  expect(root.find('/group')!.value).toEqual({
    value: 'descendant',
    extra: 42,
  });
});

it('does not resolve values whose effective exit policy clears them', () => {
  const resolver = vi.fn(() => 'after');
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open', unsetOnInactive: true },
        properties: {
          value: { type: 'string', controls: { inactiveValue: resolver } },
        },
      },
    },
  });
  root.setValue({ open: true, group: { value: 'before' } });
  root.find('/open')!.setValue(false);
  expect(resolver).not.toHaveBeenCalled();
  expect(root.inactiveValues).toEqual([]);
});
