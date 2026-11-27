import { expectTypeOf, it } from 'vitest';

import type { Nullable } from '@aileron/declare';

import type { ArraySchema, StringSchema } from '@/schema-form/types';

import type { StringCheckboxJSONSchema } from '../type';

it('keeps checkbox items exactly a string schema', () => {
  expectTypeOf<
    StringCheckboxJSONSchema['items']
  >().branded.toEqualTypeOf<StringSchema>();
});

it('preserves nullable and non-nullable array type members', () => {
  expectTypeOf<StringCheckboxJSONSchema['type']>().toEqualTypeOf<
    ArraySchema['type']
  >();
});

it('keeps enum elements nullable strings without number or any', () => {
  expectTypeOf<
    NonNullable<StringCheckboxJSONSchema['items']['enum']>[number]
  >().toEqualTypeOf<Nullable<string>>();
});
