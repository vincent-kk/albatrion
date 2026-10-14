import type { ComponentType } from 'react';

import type { Roll } from '@aileron/declare';

import type {
  AllowedValue,
  ChildFieldProps,
  FieldInputProps,
} from '@/schema-form/types';

export type FormInputProps<Value extends AllowedValue> = {
  path?: string;
  FieldInput?: ComponentType<FieldInputProps<Value>>;
} & ChildFieldProps;

export type RolledFormInputProps<Value extends AllowedValue> = Roll<
  FormInputProps<Value>
>;
