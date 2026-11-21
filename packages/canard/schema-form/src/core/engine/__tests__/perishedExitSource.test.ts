import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

it('discards a pending exit input when its containing array item perishes', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        otherOn: { type: 'boolean' },
        other: { type: 'string', controls: { active: '/otherOn === true' } },
        start: {
          type: 'boolean',
          controls: {
            injectTo: (on) =>
              on ? { '../list/0/y': 'stale', '../trim': true } : {},
          },
        },
        trim: {
          type: 'boolean',
          controls: {
            injectTo: (on) => (on ? { '../list': [], '../grow': true } : {}),
          },
        },
        grow: {
          type: 'boolean',
          controls: {
            injectTo: (on) =>
              on ? { '../list': [{}], '../otherOn': false } : {},
          },
        },
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              y: { type: 'string', controls: { active: '/on === true' } },
            },
          },
        },
      },
    },
    defaultValue: {
      on: true,
      otherOn: true,
      other: 'old',
      list: [{ y: 'old' }],
    },
    validationMode: ValidationMode.None,
  });
  const originalItem = root.find('/list/0');
  expect(originalItem?.value).toEqual({ y: 'old' });
  root.setValue({ on: false, start: true }, WriteOption.Merge);
  expect(root.find('/other')).toBeNull();
  expect(root.find('/list/0')).not.toBeNull();
  expect(root.find('/list/0')).not.toBe(originalItem);
  expect(root.inactiveValues).not.toContainEqual({
    path: '/list/0/y',
    value: 'stale',
  });
  root.find('/on')!.setValue(true);
  expect(root.find('/list/0/y')!.value).toBeUndefined();
});
