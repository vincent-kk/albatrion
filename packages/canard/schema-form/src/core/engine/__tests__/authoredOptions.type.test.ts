import { expectTypeOf, it } from 'vitest';

import type {
  CHILD_CONTROL_KEYS,
  RESERVED_SCHEMA_KEYS,
} from '@/schema-form/constants/reservedSchemaKeys';

import type { ChildSchemaControls, SchemaControls } from '../types/controls';
import type { AuthoredSchema } from '../types/jsonSchema';

it('keeps authored extensions any and reserved options precise', () => {
  expectTypeOf<NonNullable<AuthoredSchema['options']>['custom']>().toBeAny();
  expectTypeOf<NonNullable<AuthoredSchema['options']>['trim']>().toEqualTypeOf<
    boolean | undefined
  >();
  expectTypeOf<
    NonNullable<AuthoredSchema['options']>['propertyOrder']
  >().toEqualTypeOf<readonly string[] | undefined>();
  expectTypeOf<
    NonNullable<AuthoredSchema<{ custom: number }>['options']>['custom']
  >().toEqualTypeOf<number>();
});

/** Remove extension index signatures while retaining explicitly authored option keys. */
type NamedKeys<T> = keyof {
  [Key in keyof T as string extends Key
    ? never
    : number extends Key
      ? never
      : Key]: T[Key];
};

it('checks core authoring and canonical reserved keys in both directions', () => {
  expectTypeOf<keyof SchemaControls<unknown>>().toEqualTypeOf<
    keyof typeof RESERVED_SCHEMA_KEYS.controls
  >();
  expectTypeOf<keyof ChildSchemaControls>().toEqualTypeOf<
    (typeof CHILD_CONTROL_KEYS)[number]
  >();
  expectTypeOf<
    NamedKeys<NonNullable<AuthoredSchema['options']>>
  >().toEqualTypeOf<keyof typeof RESERVED_SCHEMA_KEYS.options>();
});
