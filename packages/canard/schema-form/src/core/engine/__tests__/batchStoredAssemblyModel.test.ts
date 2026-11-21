import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';
import { hasSameOrderedKeys } from './fixtures/hasSameOrderedKeys';

it.each([false, true])(
  'reads declared, priority, and extra own keys in both write orders (%s propertyOrder)',
  (priority) => {
    const text = { type: 'string' } as const;
    const first = {
      b: 'B',
      extra2: 'two',
      ['__proto__']: 'data',
      a: 'A',
      constructor: 'ctor',
      toString: 'text',
      extra1: 'one',
    };
    const second = {
      extra3: 'three',
      toString: 'updated',
      a: 'updated',
      extra2: 'updated',
    };
    for (const reverse of [false, true])
      for (const option of [
        WriteOption.Overwrite,
        WriteOption.Merge,
      ] as const) {
        const run = (batched: boolean) => {
          const root = nodeFromJSONSchema({
            jsonSchema: {
              type: 'object',
              properties: {
                o: {
                  type: 'object',
                  options: {
                    propertyOrder: priority
                      ? ['extra1', 'toString', 'extra3', '__proto__']
                      : [],
                  },
                  properties: {
                    a: text,
                    b: text,
                    ['__proto__']: text,
                    constructor: text,
                    toString: text,
                  },
                },
              },
            },
            defaultValue: {},
            validationMode: ValidationMode.None,
            disableAutomaticWrites: true,
          });
          const target = root.find('/o')!;
          const seen: unknown[] = [];
          const calls = () => {
            const direct = () => target.setValue(first, option);
            const merged = () =>
              root.setValue({ o: second }, WriteOption.Merge);
            if (reverse) {
              merged();
              direct();
            } else {
              direct();
              merged();
            }
            target.setValue((value: unknown) => {
              seen.push(value);
              return value;
            });
            root.setValue((value: unknown) => {
              seen.push(value);
              return value;
            });
          };
          if (batched) root.batch(calls);
          else calls();
          return { seen, value: root.value, retained: root.inactiveValues };
        };
        const expected = run(false);
        const actual = run(true);
        expect(actual).toStrictEqual(expected);
        expect(hasSameOrderedKeys(actual, expected)).toBe(true);
      }
  },
);

it.each([false, true])(
  'reads stored array slots and child emissions in both write orders (%s trailing omission)',
  (omitTrailingEmpty) => {
    const sparse = Array<string | undefined>(4);
    sparse[1] = '';
    sparse[2] = 'new';
    for (const reverse of [false, true])
      for (const prefixOnly of [false, true]) {
        const run = (batched: boolean) => {
          const item = { type: 'string' } as const;
          const root = nodeFromJSONSchema({
            jsonSchema: {
              type: 'object',
              properties: {
                arr: {
                  type: 'array',
                  ...(prefixOnly
                    ? { prefixItems: [item, item] }
                    : { items: item }),
                  options: { omitTrailingEmpty },
                },
                other: { type: 'boolean' },
              },
            },
            defaultValue: {
              arr: ['one', 'two', 'three', 'four'],
              other: false,
            },
            validationMode: ValidationMode.None,
            disableAutomaticWrites: true,
          });
          const array = root.find('/arr')!;
          const seen: unknown[] = [];
          const calls = () => {
            const whole = () => array.setValue(sparse);
            const slot = () => root.find('/arr/1')!.setValue('replacement');
            if (reverse) {
              slot();
              whole();
            } else {
              whole();
              slot();
            }
            array.setValue((value: unknown) => {
              seen.push(value);
              return value;
            });
            root.setValue((value: unknown) => {
              seen.push(value);
              return value;
            });
          };
          if (batched) root.batch(calls);
          else calls();
          return { seen, value: root.value };
        };
        const expected = run(false);
        const actual = run(true);
        expect(actual).toStrictEqual(expected);
        expect(hasSameOrderedKeys(actual, expected)).toBe(true);
      }
  },
);
