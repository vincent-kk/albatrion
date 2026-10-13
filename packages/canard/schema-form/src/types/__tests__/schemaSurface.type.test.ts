import { describe, expectTypeOf, it } from 'vitest';

import type {
  BasicSchema,
  NonNullableObjectSchema,
  NullableObjectSchema,
} from '../jsonSchema';

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
});
