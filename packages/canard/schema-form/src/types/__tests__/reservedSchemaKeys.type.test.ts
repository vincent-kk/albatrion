import { expectTypeOf, it } from 'vitest';

import type { RESERVED_SCHEMA_KEYS } from '@/schema-form/constants/reservedSchemaKeys';

import type { JSONSchema, SchemaPresentation } from '../schema/jsonSchema';

/** Explicit declarations stay visible when an extension index signature is present. */
type NamedKeys<T> = keyof {
  [Key in keyof T as string extends Key
    ? never
    : number extends Key
      ? never
      : Key]: T[Key];
};

it('checks binding authoring and canonical keys in both directions', () => {
  expectTypeOf<NamedKeys<SchemaPresentation>>().toEqualTypeOf<
    keyof typeof RESERVED_SCHEMA_KEYS.presentation
  >();
  expectTypeOf<NamedKeys<NonNullable<JSONSchema['options']>>>().toEqualTypeOf<
    keyof typeof RESERVED_SCHEMA_KEYS.options
  >();
});
