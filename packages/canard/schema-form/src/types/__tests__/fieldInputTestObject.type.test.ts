import { describe, expectTypeOf, it } from 'vitest';

import type { FieldNode } from '@/schema-form/core';

import type {
  FieldInputTestObject,
  FieldNodeType,
} from '../internal/fieldInput';

/** The explicit shape FieldInputTestObject had before it was derived from FieldInputHint. */
type ExplicitTestObject = Partial<{
  type: FieldNodeType | FieldNodeType[];
  schemaType: FieldNode['schemaType'] | FieldNode['schemaType'][];
  path: string | string[];
  required: boolean;
  nullable: boolean;
  format: string | undefined | (string | undefined)[];
  inputType: string | undefined | (string | undefined)[];
}>;

describe('FieldInputTestObject', () => {
  it('keeps the explicit shape while being derived from FieldInputHint', () => {
    expectTypeOf<FieldInputTestObject>().toEqualTypeOf<ExplicitTestObject>();
  });
});
