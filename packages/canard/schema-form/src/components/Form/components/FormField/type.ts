import type { ComponentType, PropsWithChildren } from 'react';

import type { Dictionary, Roll } from '@aileron/declare';

import type {
  AllowedValue,
  ChildFieldProps,
  FieldInputProps,
  BaseFieldRendererProps,
} from '@/schema-form/types';

export type BaseFormFieldProps<Value extends AllowedValue> = {
  path?: string;
  FieldInput?: ComponentType<FieldInputProps<Value>>;
  FieldRenderer?: ComponentType<BaseFieldRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
} & ChildFieldProps;

export type FormFieldProps<Value extends AllowedValue> = Roll<
  BaseFormFieldProps<Value>
>;
