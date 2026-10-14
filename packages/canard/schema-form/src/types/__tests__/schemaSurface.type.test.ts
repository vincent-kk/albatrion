import { describe, expectTypeOf, it } from 'vitest';

import type {
  BasicSchema,
  JSONSchema,
  NonNullableArraySchema,
  NonNullableObjectSchema,
  NullableArraySchema,
  NullableObjectSchema,
} from '../types/jsonSchema';

/** Named members of a type, without the `[alt: string]: any` index signature. */
type NamedKeys<Type> = keyof {
  [Key in keyof Type as string extends Key
    ? never
    : number extends Key
      ? never
      : Key]: Type[Key];
};

/** Schema-level authoring keys replaced by controls, options or presentation. */
type RemovedSchemaKeys =
  | 'computed'
  | '&if'
  | '&active'
  | '&visible'
  | '&pristine'
  | '&readOnly'
  | '&disabled'
  | '&watch'
  | '&derived'
  | 'injectTo'
  | 'terminal'
  | 'FieldInput'
  | 'FieldInputProps'
  | 'FieldRendererProps'
  | 'inputType'
  | 'errorMessages';

/** Object-only keys that moved under `options` (CONTROLS-051). */
type RemovedObjectKeys = 'virtual' | 'propertyKeys';

describe('schema authoring surface', () => {
  it('declares nullable as a boolean on object schemas and JSONSchema', () => {
    expectTypeOf<NonNullableObjectSchema['nullable']>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<NullableObjectSchema['nullable']>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<JSONSchema['nullable']>().toEqualTypeOf<boolean | undefined>();
  });

  it('declares none of the removed schema-level keys', () => {
    expectTypeOf<
      Extract<NamedKeys<BasicSchema>, RemovedSchemaKeys>
    >().toBeNever();
  });

  it('declares no top-level virtual or propertyKeys on object schemas', () => {
    expectTypeOf<
      Extract<
        NamedKeys<NonNullableObjectSchema>,
        RemovedSchemaKeys | RemovedObjectKeys
      >
    >().toBeNever();
    expectTypeOf<
      Extract<
        NamedKeys<NullableObjectSchema>,
        RemovedSchemaKeys | RemovedObjectKeys
      >
    >().toBeNever();
  });

  it('declares options.terminal as a boolean on object and array schemas', () => {
    type Terminal<Schema extends { options?: { terminal?: unknown } }> =
      NonNullable<Schema['options']>['terminal'];
    expectTypeOf<Terminal<NonNullableObjectSchema>>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<Terminal<NullableObjectSchema>>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<Terminal<NonNullableArraySchema>>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<Terminal<NullableArraySchema>>().toEqualTypeOf<
      boolean | undefined
    >();
  });

  it('declares options.propertyOrder as the emitted key order on object schemas', () => {
    type PropertyOrder<
      Schema extends { options?: { propertyOrder?: unknown } },
    > = NonNullable<Schema['options']>['propertyOrder'];
    expectTypeOf<PropertyOrder<NonNullableObjectSchema>>().toEqualTypeOf<
      readonly string[] | undefined
    >();
    expectTypeOf<PropertyOrder<NullableObjectSchema>>().toEqualTypeOf<
      readonly string[] | undefined
    >();
  });

  it('declares options.virtual groups whose entries name their fields', () => {
    type Virtual<Schema extends { options?: { virtual?: unknown } }> =
      NonNullable<NonNullable<Schema['options']>['virtual']>;
    expectTypeOf<
      Virtual<NonNullableObjectSchema>[string]['fields']
    >().toEqualTypeOf<readonly string[]>();
    expectTypeOf<
      Virtual<NullableObjectSchema>[string]['fields']
    >().toEqualTypeOf<readonly string[]>();
  });

  it('keeps the virtual node schema out of authoring', () => {
    expectTypeOf<Extract<JSONSchema['type'], 'virtual'>>().toBeNever();
    // @ts-expect-error VirtualNodeSchema is internal and has no export.
    type RemovedSchema = import('../types/jsonSchema').VirtualSchema;
    expectTypeOf<RemovedSchema>().toBeAny();
    // @ts-expect-error isVirtualSchema is absent from the authoring schema types.
    type RemovedGuard = typeof import('../types/jsonSchema').isVirtualSchema;
    expectTypeOf<RemovedGuard>().toBeAny();
  });
});
