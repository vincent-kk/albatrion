import type { ComponentProps, ReactElement } from 'react';

import { expectTypeOf } from 'vitest';

import type {
  ChildFieldProps,
  FieldInputProps,
  Form,
  FormProvider,
  InferValueType,
  JSONSchema,
} from '../../index';

const schema = {
  type: 'string',
  title: undefined,
} as const satisfies JSONSchema;

expectTypeOf<InferValueType<typeof schema>>().toEqualTypeOf<string>();
expectTypeOf<ReturnType<typeof FormProvider>>().toMatchTypeOf<ReactElement>();
void schema;

const checkIdentifiers = (
  input: FieldInputProps,
  child: ChildFieldProps,
  layout: ComponentProps<typeof Form.Input>,
) => {
  input.getInputId(1);
  // @ts-expect-error A keyed id requires a key.
  input.getInputId();
  // @ts-expect-error Custom inputs receive inputId instead of id.
  input.id = 'legacy';
  // @ts-expect-error Child presentation may not set inputId.
  child.inputId = 'child';
  // @ts-expect-error Layout presentation may not set labelId.
  layout.labelId = 'layout';
};
void checkIdentifiers;
