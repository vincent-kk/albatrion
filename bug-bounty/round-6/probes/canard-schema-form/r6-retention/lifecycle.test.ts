import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode, SetValueOption as WriteOption } from '@/schema-form';

it.each(['oneOf', 'anyOf', 'allOf'] as const)(
  'known absent-candidate rule: %s writes through the first candidate after the host exits',
  (composition) => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          open: { type: 'boolean' },
          number: { type: 'boolean' },
          list: {
            type: 'array',
            controls: { active: '/open === true' },
            [composition]: [
              { controls: { active: '/number === true' }, items: { type: 'number' } },
              { controls: { active: '/number !== true' }, items: { type: 'string' } },
            ],
          },
        },
      },
      defaultValue: { open: true, number: false, list: ['old'] },
      validationMode: ValidationMode.None,
    });
    root.find('/list/0')!.setValue('edited');
    root.find('/open')!.setValue(false);
    root.setValue({ list: ['later'] }, WriteOption.Merge);
    root.find('/open')!.setValue(true);
    expect(root.find('/list/0')?.value).toBeUndefined();
    root.find('/open')!.setValue(false);
    root.find('/open')!.setValue(true);
    expect(root.find('/list/0')?.value).toBeUndefined();
  },
);

it.each(['oneOf', 'anyOf', 'allOf'] as const)(
  '%s retires a second-candidate slot across length 1-0-1',
  (composition) => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          number: { type: 'boolean' },
          list: {
            type: 'array',
            [composition]: [
              { controls: { active: '/number === true' }, items: { type: 'number' } },
              { controls: { active: '/number !== true' }, items: { type: 'string' } },
            ],
          },
        },
      },
      defaultValue: { number: false, list: ['old'] },
      validationMode: ValidationMode.None,
    });
    const list = root.find('/list')!;
    root.find('/number')!.setValue(true);
    list.setValue([]);
    list.setValue([5]);
    root.find('/number')!.setValue(false);
    expect(root.find('/list/0')?.value).not.toBe('old');
  },
);

it.each(['insert', 'remove'] as const)(
  '%s follows each row retained values through two exits',
  (operation) => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          show: { type: 'boolean' },
          list: { type: 'array', items: {
            type: 'object', properties: {
              id: { type: 'string' },
              secret: { type: 'string', controls: { active: '/show === true' } },
            },
          } },
        },
      },
      defaultValue: { show: true, list: [{ id: 'a', secret: 'A' }, { id: 'b', secret: 'B' }] },
      validationMode: ValidationMode.None,
    });
    root.find('/show')!.setValue(false);
    const list = root.find('/list')!;
    if (operation === 'insert') list.insert(0, { id: 'new', secret: 'N' });
    if (operation === 'remove') list.remove(0);
    root.find('/show')!.setValue(true);
    const expected = operation === 'insert' ? [{ id: 'new', secret: 'N' }, { id: 'a', secret: 'A' }, { id: 'b', secret: 'B' }]
      : [{ id: 'b', secret: 'B' }];
    expect(list.value).toEqual(expected);
    root.find('/show')!.setValue(false);
    root.find('/show')!.setValue(true);
    expect(list.value).toEqual(expected);
  },
);

it.each([false, true])('inactive Merge ownership is transparent in batch=%s', (batch) => {
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties: {
      open: { type: 'boolean' },
      object: { type: 'object', properties: {
        a: { type: 'string', controls: { active: '/open === true' } },
        b: { type: 'string', controls: { active: '/open === true' } },
      } },
    } },
    defaultValue: { open: false, object: { a: 'A', b: 'B' } },
    validationMode: ValidationMode.None,
  });
  const write = () => {
    root.setValue({ object: { a: 'new' } }, WriteOption.Merge);
    root.setValue({ object: { b: 'later' } }, WriteOption.Merge);
  };
  if (batch) root.batch(write); else write();
  root.find('/open')!.setValue(true);
  expect(root.find('/object')!.value).toEqual({ a: 'new', b: 'later' });
});
