import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';

const schema = {
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    outside: { type: 'string' },
    a: { type: 'string' },
    b: { type: 'string', controls: { active: '../on === true' } },
  },
  options: { virtual: { group: { fields: ['a', 'b'] } } },
} as const;
const load = () =>
  nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { on: true, a: 'a0', b: 'b0', outside: 'o0' },
    validationMode: ValidationMode.None,
  });

it('inactive non-undefined tuple slots survive a multi-write batch', () => {
  const root = load();
  root.find('/on')!.setValue(false);
  root.batch(() => {
    root.find('/outside')!.setValue('o1');
    root.find('/group')!.setValue(['a1', 'b1']);
  });
  root.find('/on')!.setValue(true);
  expect(root.value).toEqual({ on: true, a: 'a1', b: 'b1', outside: 'o1' });
});
it('the pre-call inactive classification survives a gate mark in the same batch', () => {
  const root = load();
  root.find('/on')!.setValue(false);
  root.batch(() => {
    root.find('/on')!.setValue(true);
    root.find('/group')!.setValue(['a1', undefined]);
  });
  expect(root.value).toEqual({ on: true, a: 'a1', b: 'b0', outside: 'o0' });
});
it('virtual snapshot getters use constituent addresses', () => {
  const root = load();
  const group = root.find('/group')!;
  expect(group.defaultValue).toEqual(['a0', 'b0']);
  expect(group.isDivergent).toBe(false);
  root.find('/a')!.setValue('changed');
  expect(group.isDivergent).toBe(true);
});
it('virtual inactive reads use constituent storage addresses', () => {
  const root = load();
  root.find('/on')!.setValue(false);
  expect(root.find('/group')!.inactiveValues).toEqual(root.inactiveValues);
});
it('same-content virtual writes preserve retained descendants of an active object slot', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        item: {
          type: 'object',
          properties: {
            kept: { type: 'string', controls: { active: '../../on === true' } },
            shown: { type: 'string' },
          },
        },
      },
      options: { virtual: { group: { fields: ['item'] } } },
    },
    defaultValue: { on: true, item: { kept: 'retained', shown: 'shown' } },
    validationMode: ValidationMode.None,
  });
  root.find('/on')!.setValue(false);
  const before = root.inactiveValues;
  root.find('/group')!.setValue([{ shown: 'shown' }]);
  expect(root.inactiveValues).toEqual(before);
  root.find('/on')!.setValue(true);
  expect(root.value).toEqual({
    on: true,
    item: { kept: 'retained', shown: 'shown' },
  });
});
it('field names pair compressed children with uncompressed tuple slots', () => {
  const root = load();
  root.find('/on')!.setValue(false);
  const group = root.find('/group')!;
  const fields = ['a', 'b'];
  const slots = fields.map((name, index) => ({
    name,
    value: Array.isArray(group.value) ? group.value[index] : undefined,
    node: group.children?.find((child) => child.name === name),
  }));
  expect(slots.map((slot) => [slot.name, slot.value, slot.node?.path])).toEqual(
    [
      ['a', 'a0', '/a'],
      ['b', undefined, undefined],
    ],
  );
});

it('virtual inactive projections keep frozen references until a constituent changes', () => {
  const root = load();
  root.find('/on')!.setValue(false);
  const group = root.find('/group')!;
  const first = group.inactiveValues;
  expect(Object.isFrozen(first)).toBe(true);
  expect(group.inactiveValues).toBe(first);
  root.setValue({ ...root.value, b: 'b1' });
  expect(group.inactiveValues).toEqual([{ path: '/b', value: 'b1' }]);
  expect(group.inactiveValues).not.toBe(first);
  expect(first).toEqual([{ path: '/b', value: 'b0' }]);
  root.find('/on')!.setValue(true);
  expect(group.inactiveValues).toEqual([]);
});

it('virtual getter projections use declaration names with escaped physical addresses', () => {
  const textField: { type: 'string' } = { type: 'string' };
  const jsonSchema: AuthoredSchema = {
    type: 'object',
    properties: {
      'slash/name': { type: 'string' },
      'tilde~name': { type: 'string' },
      '': { type: 'string' },
      constructor: textField,
    },
    options: {
      virtual: {
        group: { fields: ['slash/name', 'tilde~name', '', 'constructor'] },
      },
    },
  };
  const root = nodeFromJSONSchema({
    jsonSchema,
    defaultValue: {
      'slash/name': 'slash',
      'tilde~name': 'tilde',
      '': 'empty',
      constructor: 'own',
    },
    validationMode: ValidationMode.None,
  });
  const paths = ['/slash~1name', '/tilde~0name', '/', '/constructor'];
  const group = root.find('/group')!;
  expect(group.defaultValue).toEqual(
    paths.map((path) => root.find(path)!.defaultValue),
  );
  expect(group.isDivergent).toBe(
    paths.some((path) => root.find(path)!.isDivergent),
  );
  root.find('/slash~1name')!.setValue('changed');
  expect(group.isDivergent).toBe(
    paths.some((path) => root.find(path)!.isDivergent),
  );
});
