import { expect, it } from 'vitest';

import { type JSONSchema as AuthoredSchema, ValidationMode } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

const schema = {
  type: 'object',
  properties: {
    yOn: { type: 'boolean' },
    other: { type: 'boolean' },
    object: {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string', controls: { active: '/yOn === true' } },
      },
    },
  },
} as const satisfies AuthoredSchema;

/**
 * Empty the object so its parent omits it while its own stored value stays an empty object,
 * then hand the updater's input to the caller, in a batch or alone.
 */
const observe = (batched: boolean) => {
  const root = mountEngineForm({
    jsonSchema: schema,
    defaultValue: { yOn: true, object: { x: 'x0' } },
    validationMode: ValidationMode.None,
  });
  root.find('/object')!.setValue(undefined);
  root.find('/object/y')!.setValue('y7');
  root.find('/yOn')!.setValue(false);
  const received: unknown[] = [];
  const write = () => {
    root.find('/other')!.setValue(true);
    root.find('/object')!.setValue((previous: unknown) => {
      received.push(previous);
      return previous;
    });
  };
  if (batched) root.batch(write);
  else write();
  return {
    received,
    value: root.value,
    retained: root.inactiveValues.map(({ path, value }) => ({ path, value })),
  };
};

it('a batched updater receives the target own committed value the same as outside a batch', () => {
  expect(observe(true)).toEqual(observe(false));
});

it.each(['items', 'prefixItems'] as const)(
  'uses the default %s candidate when a batch updater reads an uncreated slot',
  (keyword) => {
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: {
          a: { type: 'boolean' },
          b: { type: 'boolean' },
          list: {
            type: 'array',
            allOf: [
              {
                controls: { active: '../a' },
                [keyword]:
                  keyword === 'items'
                    ? { type: 'string' }
                    : [{ type: 'string' }],
              },
              {
                controls: { active: '../b' },
                [keyword]:
                  keyword === 'items'
                    ? { type: 'number' }
                    : [{ type: 'number' }],
              },
            ],
          },
        },
      },
      defaultValue: { a: false, b: true, list: [] },
    });
    const list = root.find('/list')!;
    expect(list.find('./0')).toBeNull();
    const seen: unknown[] = [];
    root.batch(() => {
      list.setValue([12]);
      list.setValue((value: unknown) => {
        seen.push(value);
        return [13];
      });
    });
    expect(seen).toEqual([['12']]);
    expect(root.find('/list/0')!.value).toBe(13);
  },
);
