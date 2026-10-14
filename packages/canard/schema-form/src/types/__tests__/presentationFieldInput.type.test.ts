import { Component, memo } from 'react';

import { describe, expectTypeOf, it } from 'vitest';

import type {
  FieldInputProps,
  FieldInputPropsWithSchema,
} from '../internal/fieldInput';
import type {
  BaseBooleanSchema,
  JSONSchema,
  SchemaPresentation,
} from '../internal/jsonSchema';

/** Component alternatives admitted by the schema's presentation input slot. */
type Slot = NonNullable<SchemaPresentation['FieldInput']>;
/**
 * Model a plugin input specialized for boolean values and schemas.
 * @param _ - Binding props with a boolean value and its matching schema.
 * @returns No rendered content; the test checks the component signature.
 */
const NarrowInput = (_: FieldInputPropsWithSchema<boolean, BaseBooleanSchema>) =>
  null;
/** Class component using the binding's default input props. */
class ClassInput extends Component<FieldInputProps> {
  /** @returns No rendered content; the test checks class component compatibility. */
  render() {
    return null;
  }
}

describe('presentation.FieldInput slot', () => {
  it('accepts narrow plugin inputs, memo and class components without a cast', () => {
    const schema = {
      type: 'boolean',
      presentation: { FieldInput: NarrowInput },
    } satisfies JSONSchema;
    expectTypeOf(schema.presentation.FieldInput).toExtend<Slot>();
    expectTypeOf(memo(NarrowInput)).toExtend<Slot>();
    expectTypeOf(ClassInput).toExtend<Slot>();
    expectTypeOf(null).toExtend<SchemaPresentation['FieldInput']>();
  });
  it('rejects values that are not an input component', () => {
    // @ts-expect-error a mandatory prop the binding never supplies
    expectTypeOf((_: { foo: string }) => null).toExtend<Slot>();
    // @ts-expect-error a named prop declared with a conflicting type
    expectTypeOf((_: { disabled: string }) => null).toExtend<Slot>();
    // @ts-expect-error a number is not a component
    expectTypeOf(123).toExtend<Slot>();
    // @ts-expect-error a string is not a component
    expectTypeOf('Input').toExtend<Slot>();
  });
});
