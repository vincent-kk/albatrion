import type { ComponentType, PropsWithChildren } from 'react';

import type { Dictionary, Roll } from '@aileron/declare';

import type {
  AllowedValue,
  FieldInputProps,
  FieldRendererProps,
  OverridableFieldInputProps,
} from '@/schema-form/types';

export type FormFieldProps<Value extends AllowedValue> = {
  path?: string;
  FieldInput?: ComponentType<FieldInputProps<Value>>;
  FieldRenderer?: ComponentType<FieldRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
} & OverridableFieldInputProps;

export type RolledFormFieldProps<Value extends AllowedValue> = Roll<
  FormFieldProps<Value>
>;
