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

/** Authoring keys that 0.16.0 declared and the controls surface replaced (CONTROLS-016, CONTROLS-051). */
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
  | 'terminal';

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
