import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

it('reselects a cloned nested host from its fixed baseline using current gate inputs', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      kind: { type: 'string' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        oneOf: [
          {
            controls: { active: '../kind === "string"' },
            properties: { value: { type: 'string' } },
          },
          {
            controls: { active: '../kind === "number"' },
            properties: { value: { type: 'number', default: 37 } },
          },
        ],
      },
    },
  });
  root.setValue({ open: true, kind: 'string', group: { value: 'saved' } });
  const oldGroup = root.find('/group')!;
  const oldString = root.find('/group/value')!;
  root.find('/open')!.setValue(false);
  expect(Reflect.get(root, 'inactiveSlots')).toBeInstanceOf(Map);
  root.find('/kind')!.setValue('number');
  root.find('/open')!.setValue(true);
  const number = root.find('/group/value')!;
  expect(root.find('/group')).not.toBe(oldGroup);
  expect(number.type).toBe('number');
  expect(number.value).toBe(37);
  expect(oldString.value).toBe('saved');
  root.find('/kind')!.setValue('string');
  expect(root.find('/group/value')!.value).toBe('saved');
  expect(root.find('/group/value')).not.toBe(oldString);
});

it('does not use a retained candidate as the previous active shape', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      allow: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          value: { type: 'string', controls: { active: '#/allow' } },
        },
      },
    },
  });
  root.setValue({ open: true, allow: true, group: { value: 'saved' } });
  root.find('/open')!.setValue(false);
  expect(Reflect.get(root, 'inactiveSlots')).toBeInstanceOf(Map);
  root.find('/allow')!.setValue(false);
  root.find('/open')!.setValue(true);
  expect(root.find('/group/value')).toBeNull();
  expect(root.find('/group')!.value).toEqual({});
  root.find('/allow')!.setValue(true);
  expect(root.find('/group/value')!.value).toBe('saved');
});
