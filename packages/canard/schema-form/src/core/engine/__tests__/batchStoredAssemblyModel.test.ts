import { expect, it, vi } from 'vitest';

import { isArray, isPlainObject } from '@winglet/common-utils/filter';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';
import { hasSameOrderedKeys } from './fixtures/hasSameOrderedKeys';

it('reads declared, priority, and extra own keys in both write orders', () => {
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
  const observed = new Set<string>();
  for (const priority of [false, true])
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
          const directWrites = vi.spyOn(target, 'setValue');
          const rootWrites = vi.spyOn(root, 'setValue');
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
          if (batched) {
            expect(seen).toHaveLength(2);
            expect(
              target.children?.map((child) => child.name).sort(),
              'observed declared child names',
            ).toEqual(['__proto__', 'a', 'b', 'constructor', 'toString']);
            const directInput = directWrites.mock.calls[0]?.[0];
            expect(
              Object.keys(directInput ?? {}),
              'observed reversed target keys',
            ).toEqual([
              'b',
              'extra2',
              '__proto__',
              'a',
              'constructor',
              'toString',
              'extra1',
            ]);
            const mergeInput = rootWrites.mock.calls[0]?.[0];
            expect(
              Object.keys(
                isPlainObject(mergeInput) ? (mergeInput.o ?? {}) : {},
              ),
              'observed mixed root Merge keys',
            ).toEqual(['extra3', 'toString', 'a', 'extra2']);
            expect(rootWrites.mock.calls[0]?.[1]).toBe(WriteOption.Merge);
            const directOption = directWrites.mock.calls[0]?.[1];
            expect([WriteOption.Overwrite, WriteOption.Merge]).toContain(
              directOption,
            );
            const schema = target.jsonSchema;
            const options = isPlainObject(schema) ? schema.options : undefined;
            const order = isPlainObject(options)
              ? options.propertyOrder
              : undefined;
            const hasPriority = isArray(order) && order.length > 0;
            if (hasPriority)
              expect(order, 'observed propertyOrder keys').toEqual([
                'extra1',
                'toString',
                'extra3',
                '__proto__',
              ]);

            const schemaOrder = hasPriority ? 'priority' : 'declaration';
            const write =
              directOption === WriteOption.Merge ? 'merge' : 'overwrite';
            const firstCall =
              directWrites.mock.invocationCallOrder[0] <
              rootWrites.mock.invocationCallOrder[0]
                ? 'target first'
                : 'root first';
            observed.add(`${schemaOrder} / ${write} / ${firstCall}`);
          }
          directWrites.mockRestore();
          rootWrites.mockRestore();
          return { seen, value: root.value, retained: root.inactiveValues };
        };
        const expected = run(false);
        const actual = run(true);
        expect(actual).toStrictEqual(expected);
        expect(hasSameOrderedKeys(actual, expected)).toBe(true);
      }
  expect(observed, 'observed object histories').toEqual(
    new Set([
      'declaration / overwrite / target first',
      'declaration / overwrite / root first',
      'declaration / merge / target first',
      'declaration / merge / root first',
      'priority / overwrite / target first',
      'priority / overwrite / root first',
      'priority / merge / target first',
      'priority / merge / root first',
    ]),
  );
});

it('reads stored array slots and child emissions in both write orders', () => {
  const sparse = Array<string | undefined>(4);
  sparse[1] = '';
  sparse[2] = 'new';
  const observed = new Set<string>();
  for (const omitTrailingEmpty of [false, true])
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
          const slotNode = root.find('/arr/1')!;
          const wholeWrites = vi.spyOn(array, 'setValue');
          const itemWrites = vi.spyOn(slotNode, 'setValue');
          const layout = root.find('/arr/2') ? 'items' : 'prefix-only';
          const seen: unknown[] = [];
          const calls = () => {
            const whole = () => array.setValue(sparse);
            const slot = () => slotNode.setValue('replacement');
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
          if (batched) {
            expect(seen).toHaveLength(2);
            const wholeInput = wholeWrites.mock.calls[0]?.[0];
            expect(wholeInput).toHaveLength(4);
            expect(
              Object.keys(wholeInput ?? {}),
              'observed sparse own slots',
            ).toEqual(['1', '2']);
            expect(
              isArray(wholeInput) && wholeInput.slice(1, 3),
              'observed assigned slots',
            ).toEqual(['', 'new']);
            expect(itemWrites.mock.calls[0]).toEqual(['replacement']);
            const schema = array.jsonSchema;
            const options = isPlainObject(schema) ? schema.options : undefined;
            const trailing =
              isPlainObject(options) && options.omitTrailingEmpty === true
                ? 'omit'
                : 'keep';
            expect(array.outputValue, 'observed trailing output').toHaveLength(
              trailing === 'omit' ? 3 : 4,
            );
            const firstCall =
              wholeWrites.mock.invocationCallOrder[0] <
              itemWrites.mock.invocationCallOrder[0]
                ? 'whole first'
                : 'item first';
            observed.add(`${layout} / ${trailing} / ${firstCall}`);
          }
          wholeWrites.mockRestore();
          itemWrites.mockRestore();
          return { seen, value: root.value };
        };
        const expected = run(false);
        const actual = run(true);
        expect(actual).toStrictEqual(expected);
        expect(hasSameOrderedKeys(actual, expected)).toBe(true);
      }
  expect(observed, 'observed sparse array histories').toEqual(
    new Set([
      'items / keep / whole first',
      'items / keep / item first',
      'items / omit / whole first',
      'items / omit / item first',
      'prefix-only / keep / whole first',
      'prefix-only / keep / item first',
      'prefix-only / omit / whole first',
      'prefix-only / omit / item first',
    ]),
  );
});
