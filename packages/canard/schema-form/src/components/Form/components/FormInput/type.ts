import type { ComponentType } from 'react';

import type { Roll } from '@aileron/declare';

import type {
  AllowedValue,
  ChildFieldProps,
  FieldInputProps,
} from '@/schema-form/types';

export type BaseFormInputProps<Value extends AllowedValue> = {
  path?: string;
  FieldInput?: ComponentType<FieldInputProps<Value>>;
} & ChildFieldProps;

export type FormInputProps<Value extends AllowedValue> = Roll<
  BaseFormInputProps<Value>
>;
