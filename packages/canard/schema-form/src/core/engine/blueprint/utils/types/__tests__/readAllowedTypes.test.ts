import { expect, it } from 'vitest';

import { BlueprintErrorCode } from '../../diagnostics/constant';
import { readAllowedTypes } from '../readAllowedTypes';

it('validates the seven names, duplicates and empty lists before copying the authored types', () => {
  expect(
    readAllowedTypes(
      {
        type: [
          'string',
          'integer',
          'number',
          'boolean',
          'null',
          'object',
          'array',
        ],
      },
      '#',
    ),
  ).toEqual(['string', 'number', 'boolean', 'null', 'object', 'array']);
  expect(readAllowedTypes({ type: 'integer', nullable: true }, '#')).toEqual([
    'integer',
    'null',
  ]);
  for (const type of [
    [],
    ['invalid'],
    ['string', 'string'],
    ['string', undefined],
    7,
    null,
  ])
    expect(() => readAllowedTypes({ type }, '#/properties/a')).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.UnknownJsonSchema,
      }),
    );
});

it('preserves sparse type arrays and validation-before-iterator read order', () => {
  const sparse: unknown[] = new Array(2);
  sparse[1] = 'string';
  expect(readAllowedTypes({ type: sparse }, '#')).toEqual([
    undefined,
    'string',
  ]);
  const reads: string[] = [];
  const values = new Proxy(['string', 'null'], {
    get(target, key, receiver) {
      if (key === '0' || key === '1' || key === Symbol.iterator)
        reads.push(String(key));
      return Reflect.get(target, key, receiver);
    },
  });
  expect(readAllowedTypes({ type: values }, '#')).toEqual(['string', 'null']);
  expect(reads).toEqual([
    '0',
    '0',
    '1',
    '0',
    '1',
    'Symbol(Symbol.iterator)',
    '0',
    '1',
  ]);
});

it('retains iterator values independently of the previously validated indexed entries', () => {
  const values = ['string'];
  values[Symbol.iterator] = () => ['custom-iterator-value'].values();
  expect(readAllowedTypes({ type: values }, '#')).toEqual([
    'custom-iterator-value',
  ]);
});
