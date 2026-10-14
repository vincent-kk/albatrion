import { describe, expectTypeOf, it } from 'vitest';

import type {
  BasicSchema,
  JSONSchema,
  BaseNonNullableArraySchema,
  BaseNonNullableObjectSchema,
  BaseNullableArraySchema,
  BaseNullableObjectSchema,
} from '../internal/jsonSchema';

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
    expectTypeOf<BaseNonNullableObjectSchema['nullable']>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<BaseNullableObjectSchema['nullable']>().toEqualTypeOf<
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
        NamedKeys<BaseNonNullableObjectSchema>,
        RemovedSchemaKeys | RemovedObjectKeys
      >
    >().toBeNever();
    expectTypeOf<
      Extract<
        NamedKeys<BaseNullableObjectSchema>,
        RemovedSchemaKeys | RemovedObjectKeys
      >
    >().toBeNever();
  });

  it('declares options.terminal as a boolean on object and array schemas', () => {
    type Terminal<Schema extends { options?: { terminal?: unknown } }> =
      NonNullable<Schema['options']>['terminal'];
    expectTypeOf<Terminal<BaseNonNullableObjectSchema>>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<Terminal<BaseNullableObjectSchema>>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<Terminal<BaseNonNullableArraySchema>>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<Terminal<BaseNullableArraySchema>>().toEqualTypeOf<
      boolean | undefined
    >();
  });

  it('declares options.propertyOrder as the emitted key order on object schemas', () => {
    type PropertyOrder<
      Schema extends { options?: { propertyOrder?: unknown } },
    > = NonNullable<Schema['options']>['propertyOrder'];
    expectTypeOf<PropertyOrder<BaseNonNullableObjectSchema>>().toEqualTypeOf<
      readonly string[] | undefined
    >();
    expectTypeOf<PropertyOrder<BaseNullableObjectSchema>>().toEqualTypeOf<
      readonly string[] | undefined
    >();
  });

  it('declares options.virtual groups whose entries name their fields', () => {
    type Virtual<Schema extends { options?: { virtual?: unknown } }> =
      NonNullable<NonNullable<Schema['options']>['virtual']>;
    expectTypeOf<
      Virtual<BaseNonNullableObjectSchema>[string]['fields']
    >().toEqualTypeOf<readonly string[]>();
    expectTypeOf<
      Virtual<BaseNullableObjectSchema>[string]['fields']
    >().toEqualTypeOf<readonly string[]>();
  });

  it('keeps the virtual node schema out of authoring', () => {
    expectTypeOf<Extract<JSONSchema['type'], 'virtual'>>().toBeNever();
    // @ts-expect-error VirtualNodeSchema is internal and has no export.
    type RemovedSchema = import('../internal/jsonSchema').VirtualSchema;
    expectTypeOf<RemovedSchema>().toBeAny();
    // @ts-expect-error isVirtualSchema is absent from the authoring schema types.
    type RemovedGuard = typeof import('../internal/jsonSchema').isVirtualSchema;
    expectTypeOf<RemovedGuard>().toBeAny();
  });
});
